import { z } from "zod";

export const createAccountSchema = z.object({
  currency: z.enum(["USD", "INR"]),
});

export type CreateAccountDto = z.infer<typeof createAccountSchema>;
