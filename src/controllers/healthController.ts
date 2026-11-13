import { Request, Response } from "express";

export const getHealthStatus = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "AS Portfolio Builder API Server is healthy and running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
};
