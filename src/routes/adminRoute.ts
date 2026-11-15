import { Router, Request, Response } from "express";
import { prisma } from "../config/db";

const adminRouter = Router();

// GET /api/v1/admin/stats - Actual platform business metrics directly from DB
adminRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalPortfolios,
      publishedPortfolios,
      totalDomains,
      activeSubscriptions,
      allSubscriptions,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.portfolio.count(),
      prisma.portfolio.count({ where: { isPublished: true } }),
      prisma.customDomain.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.findMany({
        include: { plan: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate MRR from active subscriptions
    const mrr = allSubscriptions.reduce((acc, sub) => {
      if (sub.status === "ACTIVE" && sub.plan) {
        return acc + sub.plan.priceMonth;
      }
      return acc;
    }, 0);

    const arr = mrr * 12;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPortfolios,
        publishedPortfolios,
        totalDomains,
        activeSubscriptions,
        mrr,
        arr,
        recentUsers,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      error: error?.message,
    });
  }
});

// GET /api/v1/admin/users - List all registered users
adminRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where: any = {};
    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        workspaces: {
          select: {
            id: true,
            name: true,
            slug: true,
            portfolios: {
              select: {
                id: true,
                title: true,
                isPublished: true,
              },
            },
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error?.message,
    });
  }
});

// PUT /api/v1/admin/users/:id/role - Update user role (admin/user)
adminRouter.put("/users/:id/role", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    if (!role || !["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'admin' or 'user'",
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error?.message,
    });
  }
});

export default adminRouter;
