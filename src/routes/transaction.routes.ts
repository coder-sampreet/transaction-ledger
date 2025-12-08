// src/routes/transaction.routes.ts

import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller.js";

const router: Router = Router();

router.post("/:id/deposit", TransactionController.deposit);
router.post("/:id/withdraw", TransactionController.withdraw);

export default router;
