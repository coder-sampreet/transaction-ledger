// src/services/transfer.service.ts

import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../configs/db.config.js";
import APIError from "../core/APIError.js";

/**
 * TransferService
 *
 * Handles:
 * - Atomic transfers
 * - SQL row-level locking (FOR UPDATE)
 * - Double-entry ledger creation (debit + credit)
 * - Idempotency safety
 * - Decimal math correctness
 */
export class TransferService {
  /**
   * Perform a transfer between two accounts.
   */
  static async performTransfer({
    fromAccountId,
    toAccountId,
    amount,
    idempotencyKey,
    reference,
  }: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    idempotencyKey?: string;
    reference?: string;
  }) {
    if (fromAccountId === toAccountId) {
      APIError.throwBadRequest("Source and destination accounts must differ");
    }

    if (amount <= 0) {
      APIError.throwBadRequest("Amount must be greater than zero");
    }

    const transferId = crypto.randomUUID();

    try {
      return await prisma.$transaction(
        async (tx) => {
          //
          // 1) Check idempotency BEFORE doing anything (and before locking to save resources)
          //
          if (idempotencyKey) {
            const existing = await tx.transfer.findUnique({
              where: { idempotencyKey: idempotencyKey },
              include: { ledgerEntries: true },
            });

            if (existing) {
              return {
                transfer: existing,
                idempotent: true,
              };
            }
          }

          //
          // 2) Deadlock-safe row locking
          //
          const [firstId, secondId] =
            fromAccountId < toAccountId
              ? [fromAccountId, toAccountId]
              : [toAccountId, fromAccountId];

          await tx.$queryRawUnsafe(
            `SELECT id FROM "Account" WHERE id IN ($1, $2) ORDER BY id FOR UPDATE`,
            firstId,
            secondId,
          );

          //
          // 3) Ensure both accounts exist
          //
          const fromAccount = await tx.account.findUnique({
            where: { id: fromAccountId },
          });
          const toAccount = await tx.account.findUnique({
            where: { id: toAccountId },
          });

          if (!fromAccount) {
            APIError.throwNotFound("Source account not found", {
              accountId: fromAccountId,
            });
          }
          if (!toAccount) {
            APIError.throwNotFound("Destination account not found", {
              accountId: toAccountId,
            });
          }

          //
          // 4) Check balance
          //
          const agg = await tx.ledgerEntry.aggregate({
            where: { accountId: fromAccountId },
            _sum: { amount: true },
          });

          const currentBalance = Number(agg._sum.amount ?? 0);

          if (currentBalance < amount) {
            APIError.throwBadRequest("Insufficient balance", {
              balance: currentBalance,
              attempted: amount,
            });
          }

          //
          // 5) Create transfer (idempotencyKey unique constraint ensures safety)
          //
          let transferRecord;
          try {
            transferRecord = await tx.transfer.create({
              data: {
                id: transferId,
                fromAccountId,
                toAccountId,
                amount: new Prisma.Decimal(amount),
                idempotencyKey: idempotencyKey ?? null,
                status: "completed",
              },
            });
          } catch (e) {
            //
            // Handle concurrent creation with same idempotencyKey (P2002)
            //
            if (
              e instanceof Prisma.PrismaClientKnownRequestError &&
              e.code === "P2002" &&
              idempotencyKey
            ) {
              const existing = await tx.transfer.findUnique({
                where: { idempotencyKey: idempotencyKey },
                include: { ledgerEntries: true },
              });

              if (existing) {
                return {
                  transfer: existing,
                  idempotent: true,
                };
              }
            }

            throw e;
          }

          //
          // 6) Create debit + credit ledger entries
          //
          await tx.ledgerEntry.createMany({
            data: [
              {
                accountId: fromAccountId,
                amount: new Prisma.Decimal(-amount),
                entryType: "transfer_debit",
                reference: reference ?? null,
                transferId: transferRecord.id,
              },
              {
                accountId: toAccountId,
                amount: new Prisma.Decimal(amount),
                entryType: "transfer_credit",
                reference: reference ?? null,
                transferId: transferRecord.id,
              },
            ],
          });

          //
          // 7) Compute new balances
          //
          const fromAgg = await tx.ledgerEntry.aggregate({
            where: { accountId: fromAccountId },
            _sum: { amount: true },
          });
          const toAgg = await tx.ledgerEntry.aggregate({
            where: { accountId: toAccountId },
            _sum: { amount: true },
          });

          const fromBalance = Number(fromAgg._sum.amount ?? 0);
          const toBalance = Number(toAgg._sum.amount ?? 0);

          return {
            transfer: {
              ...transferRecord,
              balances: {
                from: fromBalance,
                to: toBalance,
              },
            },
            idempotent: false,
          };
        },
        { timeout: 10000 },
      ); // Increase timeout for concurrency tests
    } catch (err) {
      if (err instanceof APIError) throw err;

      console.error("Transfer failed:", err);

      APIError.throwInternal("Transfer failed", {
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Fetch transfer details
   */
  static async getTransferById(id: string) {
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: { ledgerEntries: true },
    });

    if (!transfer) {
      APIError.throwNotFound("Transfer not found", { id });
    }

    return transfer;
  }
}

export default TransferService;
