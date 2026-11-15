import { Router, Request, Response } from "express";
import { prisma } from "../config/db";
import { z } from "zod";

const portfoliosRouter = Router();

// Validation schema for creating a portfolio
const createPortfolioSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  themeId: z.string().min(1, "Theme ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens"),
});

// GET /api/v1/portfolios - List portfolios (supports workspace filtering)
portfoliosRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query;

    const whereClause: any = {};
    if (workspaceId && typeof workspaceId === "string") {
      whereClause.workspaceId = workspaceId;
    }

    const portfolios = await prisma.portfolio.findMany({
      where: whereClause,
      include: {
        theme: true,
        customDomain: true,
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
            ownerId: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolios",
      error: error?.message,
    });
  }
});

// GET /api/v1/portfolios/:id - Get single portfolio
portfoliosRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        theme: true,
        customDomain: true,
        workspace: true,
      },
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: "Portfolio not found",
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio",
      error: error?.message,
    });
  }
});

// POST /api/v1/portfolios - Create new portfolio
portfoliosRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createPortfolioSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || "Validation failed",
        errors: parsed.error.format(),
      });
    }

    const { workspaceId, themeId, title, subdomain } = parsed.data;

    // Check if subdomain is already taken
    const existing = await prisma.portfolio.findUnique({
      where: { subdomain },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Subdomain '${subdomain}' is already taken. Please pick another.`,
      });
    }

    // Default starter template content
    const defaultContent = {
      hero: {
        title: "Hello, I'm " + title,
        tagline: "Professional Portfolio built with AS Portfolio Builder",
        availability: "Available for new projects",
      },
      about: {
        bio: "Welcome to my portfolio! Here you'll find selected works and achievements.",
      },
      projects: [],
      skills: ["Design", "Development", "Strategy"],
    };

    const defaultStyle = {
      primaryColor: "#064B2B",
      accentColor: "#16803D",
      fontFamily: "Inter, sans-serif",
      darkMode: false,
      roundedCorners: "16px",
    };

    const newPortfolio = await prisma.portfolio.create({
      data: {
        workspaceId,
        themeId,
        title,
        subdomain,
        isPublished: false,
        contentData: defaultContent,
        styleConfig: defaultStyle,
      },
      include: {
        theme: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Portfolio created successfully",
      data: newPortfolio,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create portfolio",
      error: error?.message,
    });
  }
});

// PUT /api/v1/portfolios/:id - Update portfolio details/content
portfoliosRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, isPublished, contentData, styleConfig, themeId } = req.body;

    const updated = await prisma.portfolio.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(isPublished !== undefined && { isPublished }),
        ...(contentData !== undefined && { contentData }),
        ...(styleConfig !== undefined && { styleConfig }),
        ...(themeId !== undefined && { themeId }),
      },
      include: {
        theme: true,
        customDomain: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Portfolio updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update portfolio",
      error: error?.message,
    });
  }
});

// DELETE /api/v1/portfolios/:id - Delete portfolio
portfoliosRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.portfolio.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete portfolio",
      error: error?.message,
    });
  }
});

export default portfoliosRouter;
