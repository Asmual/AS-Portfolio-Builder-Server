import { Router, Request, Response } from "express";

const themesRouter = Router();

export interface ThemeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  previewUrl: string;
  badge?: string;
  isPremium: boolean;
  features: string[];
}

export const themesData: ThemeItem[] = [
  {
    id: "modern-dev",
    name: "Modern Developer",
    category: "Developer",
    description: "Sleek dark/light developer portfolio with project showcases, GitHub metrics, and tech stack tags.",
    previewUrl: "/images/Hero-right side image (2).jpg",
    badge: "Popular",
    isPremium: false,
    features: ["Tech Stack Icons", "Project Filters", "GitHub Stats", "Blog Integration"],
  },
  {
    id: "creative-designer",
    name: "Creative UI/UX Designer",
    category: "Designer",
    description: "Vibrant visual portfolio designed for UI/UX designers, featuring case study carousels & Figma embeds.",
    previewUrl: "/images/Hero-right side image (1).jpg",
    badge: "Trending",
    isPremium: true,
    features: ["Case Study Layouts", "Interactive Prototypes", "Testimonials", "Dribbble Stream"],
  },
  {
    id: "ecobuild-agency",
    name: "Architecture & Eco Agency",
    category: "Agency",
    description: "Architectural elegance with large hero imagery, project milestones, and client inquiry forms.",
    previewUrl: "/images/Hero-right side image (3).jpg",
    badge: "New",
    isPremium: true,
    features: ["Full-width Galleries", "Client Inquiries", "Team Profiles", "Multi-page Mode"],
  },
  {
    id: "minimal-writer",
    name: "Minimalist Freelancer",
    category: "Freelancer",
    description: "Distraction-free typography-first theme focused on writing, consulting, and fast booking.",
    previewUrl: "/images/Hero-right side image (2).jpg",
    isPremium: false,
    features: ["Reading Experience", "Calendly Embed", "Newsletter Box", "Fast Load < 1s"],
  },
];

themesRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: themesData,
  });
});

themesRouter.get("/:id", (req: Request, res: Response) => {
  const theme = themesData.find((t) => t.id === req.params.id);
  if (!theme) {
    return res.status(404).json({ success: false, message: "Theme not found" });
  }
  return res.status(200).json({ success: true, data: theme });
});

export default themesRouter;
