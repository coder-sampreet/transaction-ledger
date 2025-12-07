import env from "../configs/env.config.js";
import express from "express";
import type { Request, Response, Router } from "express";
import APIResponse from "../core/APIResponse.js";

const router: Router = express.Router();

/** Health check (liveness probe) */
router.get("/health", (req: Request, res: Response) => {
  const uptime = process.uptime();
  return APIResponse.ok(
    res,
    {
      uptimeSeconds: uptime,
      uptimeFormatted: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    },
    "Service is healthy",
  );
});

/** Info (version/build metadata) */
router.get("/info", (req: Request, res: Response) => {
  return APIResponse.ok(res, {
    name: process.env.npm_package_name || "unknown",
    version: process.env.npm_package_version || "unknown",
    env: env.NODE_ENV,
  });
});

export default router;
