import { prisma } from "../configs/db.config.js";
import APIError from "../core/APIError.js";
import type { CreateAccountDto } from "../dtos/account.dto.js";

export class AccountService {
  /** Create new account */
  static async createAccount(data: CreateAccountDto) {
    try {
      return await prisma.account.create({ data });
    } catch (err) {
      console.error("Failed to create account:", err);
      APIError.throwInternal("Failed to create account");
    }
  }

  /** Get account by ID */
  static async getAccountById(id: string) {
    const account = await prisma.account.findUnique({
      where: { id },
    });

    if (!account) {
      APIError.throwNotFound("Account not found", { accountId: id });
    }

    return account;
  }

  /** Compute balance from ledger entries */
  static async getAccountBalance(accountId: string) {
    const result = await prisma.ledgerEntry.aggregate({
      where: { accountId },
      _sum: { amount: true },
    });

    return {
      balance: result._sum.amount ?? 0,
    };
  }

  /** Paginated ledger entries */
  static async getAccountLedger(
    accountId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const entries = await prisma.ledgerEntry.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.ledgerEntry.count({ where: { accountId } });

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
