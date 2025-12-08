import { Router } from "express";
import { AccountController } from "../controllers/account.controller.js";
import { TransactionController } from "../controllers/transaction.controller.js";

const router: Router = Router();

router.post("/", AccountController.createAccount);
router.get("/:id", AccountController.getAccount);
router.get("/:id/balance", AccountController.getBalance);
router.get("/:id/ledger", AccountController.getLedger);

router.post("/:id/deposit", TransactionController.deposit);
router.post("/:id/withdraw", TransactionController.withdraw);

export default router;
