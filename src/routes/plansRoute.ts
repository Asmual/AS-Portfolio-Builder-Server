import { Router, Request, Response } from "express";

const plansRouter = Router();

export const plansData = [
  {
    id: "starter",
    name: "Starter Creator",
    description: "Ideal for students and individual professionals launching their brand.",
    priceMonthly: 5,
    priceYearly: 48,
    features: [
      "1 Live Portfolio Site",
      "Connect 1 Custom Domain (.com, .dev, etc.)",
      "Free SSL & High-Speed CDN Delivery",
      "All Standard Themes & Color Palettes",
      "Interactive Project & Case Study Blocks",
      "Built-in Contact Form with Email Alerts",
    ],
    isPopular: false,
    ctaText: "Choose Starter",
  },
  {
    id: "pro",
    name: "Pro Professional",
    description: "Essential for freelancers, senior developers & designers.",
    priceMonthly: 15,
    priceYearly: 144,
    features: [
      "Up to 3 Active Portfolios",
      "Unlimited Custom Domains & Subdomains",
      "All Premium & 3D Interactive Themes",
      "Remove AS Portfolio Builder Badge",
      "Custom Code Embeds & Custom CSS",
      "Visitor Analytics & Referrer Stats",
      "Priority Fast-Response Support",
    ],
    isPopular: true,
    ctaText: "Upgrade to Pro",
  },
  {
    id: "agency",
    name: "Agency & Studio",
    description: "For creative agencies managing multiple client portfolios.",
    priceMonthly: 35,
    priceYearly: 336,
    features: [
      "Up to 15 Active Client Portfolios",
      "Multi-User Team & Client Access Handoff",
      "White-label Client Delivery Portal",
      "Custom Domain SSL Auto-Provisioning",
      "Dedicated Account Concierge",
      "Early Access to Exclusive Themes",
      "99.9% High Availability SLA",
    ],
    isPopular: false,
    ctaText: "Contact Agency",
  },
];

plansRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    count: plansData.length,
    data: plansData,
  });
});

export default plansRouter;
