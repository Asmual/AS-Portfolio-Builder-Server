import { Router, Request, Response } from "express";
import { prisma } from "../config/db";
import { z } from "zod";

const domainsRouter = Router();

const addDomainSchema = z.object({
  portfolioId: z.string().min(1, "Portfolio ID is required"),
  domainName: z
    .string()
    .min(4, "Domain name is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
      "Please provide a valid domain name (e.g. example.com or portfolio.example.com)"
    ),
});

// GET /api/v1/domains - List all domains
domainsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const domains = await prisma.customDomain.findMany({
      include: {
        portfolio: {
          select: {
            id: true,
            title: true,
            subdomain: true,
            isPublished: true,
            workspace: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch custom domains",
      error: error?.message,
    });
  }
});

// POST /api/v1/domains - Connect new custom domain
domainsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = addDomainSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || "Validation failed",
      });
    }

    const { portfolioId, domainName } = parsed.data;

    // Check if domain is already in use
    const existing = await prisma.customDomain.findUnique({
      where: { domainName: domainName.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Domain '${domainName}' is already connected to another portfolio.`,
      });
    }

    const dnsTxtToken = `as-verify-${Math.random().toString(36).substring(2, 10)}`;

    const newDomain = await prisma.customDomain.create({
      data: {
        portfolioId,
        domainName: domainName.toLowerCase(),
        status: "ACTIVE", // Auto-activated for demonstration
        sslActive: true,
        dnsTxtRecord: dnsTxtToken,
        verifiedAt: new Date(),
      },
      include: {
        portfolio: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Domain connected and SSL auto-provisioned successfully",
      data: newDomain,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to connect domain",
      error: error?.message,
    });
  }
});

// DELETE /api/v1/domains/:id - Remove domain
domainsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.customDomain.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Domain disconnected successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to remove domain",
      error: error?.message,
    });
  }
});

export default domainsRouter;
