// src/dtos/transaction.dto.ts
import { z } from "zod";

export const depositSchema = z.object({
  amount: z.number().positive("Deposit amount must be positive"),
  reference: z.string().optional(),
});

export const withdrawalSchema = z.object({
  amount: z.number().positive("Withdrawal amount must be positive"),
  reference: z.string().optional(),
});

export type DepositDto = z.infer<typeof depositSchema>;
export type WithdrawalDto = z.infer<typeof withdrawalSchema>;
