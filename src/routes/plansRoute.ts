import { Router, Request, Response } from "express";

const plansRouter = Router();

export const plansData = [
  {
    id: "free",
    name: "Free Starter",
    description: "Perfect for testing and building your first portfolio.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "1 Published Portfolio",
      "Free platform subdomain (.asportfolio.site)",
      "Standard Themes Included",
      "Community Support",
      "SSL Included",
    ],
    isPopular: false,
    ctaText: "Start Free",
  },
  {
    id: "pro",
    name: "Pro Creator",
    description: "Best for professionals needing custom domains & advanced themes.",
    priceMonthly: 12,
    priceYearly: 120,
    features: [
      "Custom Domain Connection (e.g. yourname.com)",
      "All Premium Themes Unlocked",
      "Remove Platform Branding",
      "Visitor Analytics & Tracking",
      "Priority Email Support",
      "Unlimited Media Storage",
    ],
    isPopular: true,
    ctaText: "Get Pro Access",
  },
  {
    id: "business",
    name: "Agency & Business",
    description: "For agencies and power users managing multiple client websites.",
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      "Up to 10 Custom Domain Portfolios",
      "All Pro Features Included",
      "Custom CSS & Code Injections",
      "Client Transfer Options",
      "24/7 Dedicated Support",
      "Early Access to New Themes",
    ],
    isPopular: false,
    ctaText: "Choose Agency",
  },
];

plansRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: plansData,
  });
});

export default plansRouter;
