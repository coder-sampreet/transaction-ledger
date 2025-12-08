// tests/setup.ts

import dotenv from "dotenv";

// MUST load before anything imports Prisma or app
dotenv.config({ path: ".env.test" });

// Force Prisma binary engine during tests (avoids WASM)
process.env.PRISMA_CLIENT_ENGINE_TYPE = "binary";
process.env.PRISMA_CLI_QUERY_ENGINE_TYPE = "binary";

import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/configs/db.config.js";

export const api = request(app);

// Clean DB before EACH test
beforeEach(async () => {
  await prisma.ledgerEntry.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.account.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
