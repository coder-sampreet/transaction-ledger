// src/services/transaction.service.ts
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../configs/db.config.js";
import APIError from "../core/APIError.js";

/**
 * TransactionService
 * - deposit(accountId, amount, reference?)
 * - withdraw(accountId, amount, reference?)
 *
 * Note:
 * - Prisma ledgerEntry.amount uses Decimal
 * - Prisma optional string columns expect `string | null` (not `undefined`)
 */
export class TransactionService {
  /**
   * Deposit: credit the account with a positive amount.
   */
  static async deposit(accountId: string, amount: number, reference?: string) {
    if (amount <= 0) {
      APIError.throwBadRequest("Amount must be greater than zero");
    }

    return prisma.$transaction(async (tx) => {
      // ensure account exists
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) {
        APIError.throwNotFound("Account not found", { accountId });
      }

      // create ledger entry (credit)
      const entry = await tx.ledgerEntry.create({
        data: {
          accountId,
          amount: new Prisma.Decimal(amount),
          entryType: "deposit",
          reference: reference ?? null, // Prisma expects string | null
        },
      });

      // recalc balance (aggregate returns Decimal | null)
      const agg = await tx.ledgerEntry.aggregate({
        where: { accountId },
        _sum: { amount: true },
      });

      const balanceNum = Number(agg._sum.amount ?? 0);

      return {
        entry,
        balance: balanceNum,
      };
    });
  }

  /**
   * Withdraw: debit the account with overdraft protection.
   */
  static async withdraw(accountId: string, amount: number, reference?: string) {
    if (amount <= 0) {
      APIError.throwBadRequest("Amount must be greater than zero");
    }

    return prisma.$transaction(async (tx) => {
      // ensure account exists
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) {
        APIError.throwNotFound("Account not found", { accountId });
      }

      // compute current balance
      const agg = await tx.ledgerEntry.aggregate({
        where: { accountId },
        _sum: { amount: true },
      });

      const currentBalanceNum = Number(agg._sum.amount ?? 0);

      if (currentBalanceNum < amount) {
        APIError.throwBadRequest("Insufficient balance", {
          balance: currentBalanceNum,
          attemptedWithdraw: amount,
        });
      }

      // create ledger entry (debit)
      const entry = await tx.ledgerEntry.create({
        data: {
          accountId,
          amount: new Prisma.Decimal(-amount),
          entryType: "withdrawal",
          reference: reference ?? null,
        },
      });

      const newBalance = currentBalanceNum - amount;

      return {
        entry,
        balance: newBalance,
      };
    });
  }
}

export default TransactionService;
