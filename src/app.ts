import express, { Application, Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { config } from "./config";
import apiRouter from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { auth } from "./auth";

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Better Auth API Handler (must mount before body parsers for proper webhook/auth handling)
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "AS Portfolio Builder API",
    status: "online",
    docs: "/api/v1/health",
    auth: "/api/auth",
  });
});

// API Routes
app.use("/api/v1", apiRouter);

// Centralized error handler
app.use(errorHandler);

export default app;
