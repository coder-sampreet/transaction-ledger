// rateLimiter.middleware.ts
import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import HTTP_STATUS_CODES from "../constants/httpStatusCodes.const.js";
import { isDev } from "../configs/env.config.js";

/**
 * Global rate limiter to prevent abuse.
 * Adjust windowMs and max according to your needs.
 */
const globalRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 100, // Higher for dev, lower for prod
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  statusCode: HTTP_STATUS_CODES.TOO_MANY_REQUESTS || 429, // fallback for older const list
});
export default globalRateLimiter;
