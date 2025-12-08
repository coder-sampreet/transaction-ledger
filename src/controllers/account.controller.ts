import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import APIResponse from "../core/APIResponse.js";
import APIError from "../core/APIError.js";
import { AccountService } from "../services/account.service.js";
import { createAccountSchema } from "../dtos/account.dto.js";

export class AccountController {
  /** POST /accounts */
  static createAccount: RequestHandler = asyncHandler(async (req, res) => {
    const parsed = createAccountSchema.safeParse(req.body);

    if (!parsed.success) {
      APIError.throwBadRequest("Invalid request body", parsed.error.flatten());
    }

    const account = await AccountService.createAccount(parsed.data);
    return APIResponse.created(res, account, "Account created successfully");
  });

  /** GET /accounts/:id */
  static getAccount: RequestHandler = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) APIError.throwBadRequest("Account ID is required");

    const account = await AccountService.getAccountById(id);
    return APIResponse.ok(res, account);
  });

  /** GET /accounts/:id/balance */
  static getBalance: RequestHandler = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) APIError.throwBadRequest("Account ID is required");

    const balance = await AccountService.getAccountBalance(id);
    return APIResponse.ok(res, balance);
  });

  /** GET /accounts/:id/ledger */
  static getLedger: RequestHandler = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id) APIError.throwBadRequest("Account ID is required");

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const ledger = await AccountService.getAccountLedger(id, page, limit);
    return APIResponse.ok(res, ledger);
  });
}
