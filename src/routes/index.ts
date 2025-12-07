import express, { type Router } from "express";
import SystemRoutes from "./system.routes.js";

const router: Router = express.Router();

router.use("/system", SystemRoutes);

export default router;
