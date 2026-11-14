import { Router } from "express";
import healthRouter from "./healthRoute";
import themesRouter from "./themesRoute";
import plansRouter from "./plansRoute";

const apiRouter = Router();

apiRouter.use("/", healthRouter);
apiRouter.use("/themes", themesRouter);
apiRouter.use("/plans", plansRouter);

export default apiRouter;
