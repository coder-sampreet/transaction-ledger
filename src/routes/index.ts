import express, { type Router } from "express";
import SystemRoutes from "./system.routes.js";
import AccountRoutes from "./account.routes.js";
import TransactionRoutes from "./transaction.routes.js";
import TransferRoutes from "./transfer.routes.js";

const router: Router = express.Router();

router.use("/system", SystemRoutes);
router.use("/accounts", AccountRoutes);
router.use("/transactions", TransactionRoutes);
router.use("/transfers", TransferRoutes);

export default router;
