// src/routes/transfer.routes.ts

import { Router } from "express";
import { TransferController } from "../controllers/transfer.controller.js";

const router: Router = Router();

router.post("/", TransferController.createTransfer);
router.get("/:id", TransferController.getTransfer);

export default router;
