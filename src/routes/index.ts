import { Router } from "express";
import healthRouter from "./healthRoute";
import themesRouter from "./themesRoute";
import plansRouter from "./plansRoute";
import portfoliosRouter from "./portfoliosRoute";
import domainsRouter from "./domainsRoute";
import adminRouter from "./adminRoute";

const apiRouter = Router();

apiRouter.use("/", healthRouter);
apiRouter.use("/themes", themesRouter);
apiRouter.use("/plans", plansRouter);
apiRouter.use("/portfolios", portfoliosRouter);
apiRouter.use("/domains", domainsRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;
