import env from "./config/env.config.js";
import express from "express";
import type { Request, Response, NextFunction, Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import globalRateLimiter from "./middlewares/rateLimiter.middleware.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";
import APIError from "./core/APIError.js";

const app: Express = express();

// Logging
app.use(morgan("dev"));
//Parsers
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use(cookieParser());

// Security
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Rate limiting
app.use(globalRateLimiter);

// Routes
app.use("/api/v1", routes);

// 404 (must come after all routes)
app.use((_req: Request, _res: Response, _next: NextFunction) => {
  APIError.throwNotFound("Resource not found");
});

app.use(errorHandler);

export default app;
