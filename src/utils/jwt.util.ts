import jwt, {
  type SignOptions,
  type Secret,
  type JwtPayload,
} from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.config.js";

interface TokenPayload extends JwtPayload {
  userId: string;
  jti?: string;
}

const {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
} = env as {
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRY: string;
};

// Custom error for better handling
class InvalidTokenError extends Error {
  constructor(message = "Invalid or expired token") {
    super(message);
    this.name = "InvalidTokenError";
  }
}

const generateAccessToken = (userId: string): string => {
  const payload: TokenPayload = {
    userId,
  };
  return jwt.sign(
    payload,
    ACCESS_TOKEN_SECRET as Secret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    } as SignOptions,
  );
};

const generateRefreshToken = (userId: string): string => {
  const payload: TokenPayload = {
    userId,
    jti: crypto.randomUUID(),
  };
  return jwt.sign(
    payload,
    REFRESH_TOKEN_SECRET as Secret,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    } as SignOptions,
  );
};

const verifyAccessToken = (accessToken: string): TokenPayload => {
  try {
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET as Secret);
    if (typeof decoded === "string") throw new InvalidTokenError();
    return decoded as TokenPayload;
  } catch {
    throw new InvalidTokenError();
  }
};

const verifyRefreshToken = (refreshToken: string): TokenPayload => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as Secret);
    if (typeof decoded === "string") throw new InvalidTokenError();
    return decoded as TokenPayload;
  } catch {
    throw new InvalidTokenError();
  }
};

export type { TokenPayload };
export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  InvalidTokenError,
};
