import { Router } from "express";
import healthRouter from "./healthRoute";

const apiRouter = Router();

apiRouter.use("/", healthRouter);

export default apiRouter;
