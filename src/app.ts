import express, { Application, Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import apiRouter from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    name: "AS Portfolio Builder API",
    status: "online",
    docs: "/api/v1/health",
  });
});

// API Routes
app.use("/api/v1", apiRouter);

// Centralized error handler
app.use(errorHandler);

export default app;
