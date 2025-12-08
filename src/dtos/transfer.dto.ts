// src/dtos/transfer.dto.ts
import { z } from "zod";

export const transferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.number().positive("Amount must be positive"),
  reference: z.string().optional(),
  // idempotencyKey may be provided either in header or body — allow here too
  idempotencyKey: z.string().min(1).optional(),
});

export type TransferDto = z.infer<typeof transferSchema>;
