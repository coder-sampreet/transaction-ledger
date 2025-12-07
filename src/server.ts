import env, { isDev } from "./configs/env.config.js";

import app from "./app.js";

const PORT: number = env.PORT;
console.info(`✅ Environment: ${env.NODE_ENV}`);

const startServer = async (): Promise<void> => {
  try {
    app.listen(PORT, () => {
      if (isDev) {
        console.info(`Server is running at http://localhost:${PORT}`);
      } else {
        console.info(`Server is running at PORT: ${PORT}`);
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to start server err: ", err.message);
    } else {
      console.error("Failed to start server");
    }
    process.exit(1);
  }
};

/** Unhandled promise rejections */
process.on("unhandledRejection", (err: unknown) => {
  if (err instanceof Error) {
    console.error("Unhandled Promise Rejection:", err);
  } else {
    console.error("Unhandled Promise Rejection:", { err });
  }
  process.exit(1);
});

/** Uncaught exceptions */
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception - shutting down:", err);
  process.exit(1);
});

startServer().catch((err) => {
  console.error("Error while starting the server:", err);
  process.exit(1);
});
