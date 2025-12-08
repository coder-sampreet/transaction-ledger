// src/controllers/transfer.controller.ts

import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import APIResponse from "../core/APIResponse.js";
import APIError from "../core/APIError.js";
import { TransferService } from "../services/transfer.service.js";
import { transferSchema } from "../dtos/transfer.dto.js";

export class TransferController {
  /** POST /transfers */
  static createTransfer: RequestHandler = asyncHandler(async (req, res) => {
    const parsed = transferSchema.safeParse(req.body);

    if (!parsed.success) {
      APIError.throwBadRequest("Invalid payload", parsed.error.flatten());
    }

    const { fromAccountId, toAccountId, amount, reference, idempotencyKey } =
      parsed.data;

    const headerKey = req.header("Idempotency-Key") ?? undefined;
    const keyToUse = headerKey ?? idempotencyKey;

    // Build payload WITHOUT nulls (important!)
    const payload: {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      idempotencyKey?: string;
      reference?: string;
    } = {
      fromAccountId,
      toAccountId,
      amount,
    };

    if (keyToUse) payload.idempotencyKey = keyToUse;
    if (reference) payload.reference = reference;

    const result = await TransferService.performTransfer(payload);

    if (result.idempotent) {
      return APIResponse.ok(res, result.transfer, "Transfer already processed");
    }

    return APIResponse.created(res, result.transfer, "Transfer completed");
  });

  /** GET /transfers/:id */
  static getTransfer: RequestHandler = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) APIError.throwBadRequest("Transfer ID required");

    const transfer = await TransferService.getTransferById(id);
    return APIResponse.ok(res, transfer);
  });
}
