// src/controllers/transaction.controller.ts

import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import APIResponse from "../core/APIResponse.js";
import APIError from "../core/APIError.js";
import { TransactionService } from "../services/transaction.service.js";
import { depositSchema, withdrawalSchema } from "../dtos/transaction.dto.js";

export class TransactionController {
  /** POST /accounts/:id/deposit */
  static deposit: RequestHandler = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) APIError.throwBadRequest("Account ID is required");

    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) {
      APIError.throwBadRequest(
        "Invalid deposit payload",
        parsed.error.flatten(),
      );
    }

    const { amount, reference } = parsed.data;

    const result = await TransactionService.deposit(id, amount, reference);

    return APIResponse.created(res, result, "Deposit successful");
  });

  /** POST /accounts/:id/withdraw */
  static withdraw: RequestHandler = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) APIError.throwBadRequest("Account ID is required");

    const parsed = withdrawalSchema.safeParse(req.body);
    if (!parsed.success) {
      APIError.throwBadRequest(
        "Invalid withdrawal payload",
        parsed.error.flatten(),
      );
    }

    const { amount, reference } = parsed.data;

    const result = await TransactionService.withdraw(id, amount, reference);

    return APIResponse.ok(res, result, "Withdrawal successful");
  });
}
