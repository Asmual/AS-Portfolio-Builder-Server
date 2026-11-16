import { prisma } from "../src/config/db";
import { auth } from "../src/auth";

async function main() {
  console.log("🌱 Starting database seeding for AS Portfolio Builder...");

  // 1. Seed Plans
  console.log("📦 Seeding subscription plans...");
  const plans = [
    {
      id: "starter",
      name: "Starter Creator",
      tier: "STARTER",
      description: "Ideal for students and individual professionals launching their brand.",
      priceMonth: 5,
      priceYear: 48,
      features: [
        "1 Live Portfolio Site",
        "Connect 1 Custom Domain",
        "Free SSL & High-Speed CDN",
        "All Standard Themes & Palettes",
        "Interactive Project Blocks",
        "Built-in Contact Form",
      ],
      maxSites: 1,
      customDomain: true,
      analytics: false,
    },
    {
      id: "pro",
      name: "Pro Professional",
      tier: "PRO",
      description: "Essential for freelancers, senior developers & designers.",
      priceMonth: 15,
      priceYear: 144,
      features: [
        "Up to 3 Active Portfolios",
        "Unlimited Custom Domains & Subdomains",
        "All Premium & 3D Interactive Themes",
        "Remove AS Portfolio Builder Badge",
        "Custom Code Embeds & CSS",
        "Visitor Analytics & Referrer Stats",
        "Priority Fast-Response Support",
      ],
      maxSites: 3,
      customDomain: true,
      analytics: true,
    },
    {
      id: "agency",
      name: "Agency & Studio",
      tier: "AGENCY",
      description: "For creative agencies managing multiple client portfolios.",
      priceMonth: 35,
      priceYear: 336,
      features: [
        "Up to 15 Active Client Portfolios",
        "Multi-User Team Access Handoff",
        "White-label Client Delivery Portal",
        "Custom Domain SSL Auto-Provisioning",
        "Dedicated Account Concierge",
        "Early Access to New Themes",
        "99.9% High Availability SLA",
      ],
      maxSites: 15,
      customDomain: true,
      analytics: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }
  console.log("✅ Plans seeded successfully.");

  // 2. Seed Themes
  console.log("🎨 Seeding designer themes...");
  const themes = [
    {
      id: "modern-dev",
      name: "Modern Developer",
      category: "Developer",
      description: "Sleek terminal-inspired portfolio with GitHub activity, tech stack badges & project showcases.",
      previewUrl: "/images/Hero-right side image (3).jpg",
      badge: "Popular",
      isPremium: false,
    },
    {
      id: "creative-designer",
      name: "Creative Designer",
      category: "Design",
      description: "Bold visual layouts with full-bleed imagery, interactive case study modals & smooth micro-interactions.",
      previewUrl: "/images/Hero-right side image (2).jpg",
      badge: "Featured",
      isPremium: true,
    },
    {
      id: "minimal-creator",
      name: "Minimal Creator",
      category: "Minimal",
      description: "Ultra-clean editorial aesthetic focused on high-impact typography, writing & client projects.",
      previewUrl: "/images/Hero-right side image (1).jpg",
      badge: "New",
      isPremium: false,
    },
    {
      id: "agency-portfolio",
      name: "Agency & Studio",
      category: "Agency",
      description: "High-conversion studio showcase with service packages, client logos, case studies & booking CTAs.",
      previewUrl: "/images/Hero-right side image (3).jpg",
      badge: "Pro",
      isPremium: true,
    },
  ];

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { id: theme.id },
      update: theme,
      create: theme,
    });
  }
  console.log("✅ Themes seeded successfully.");

  // 3. Create Admin Account via Better Auth API
  console.log("👑 Creating Admin User...");
  const adminEmail = "admin@asportfolio.com";
  const adminPassword = "Admin@#772800";

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    try {
      const authRes = await auth.api.signUpEmail({
        body: {
          name: "System Administrator",
          email: adminEmail,
          password: adminPassword,
        },
      });

      if (authRes && authRes.user) {
        adminUser = await prisma.user.update({
          where: { id: authRes.user.id },
          data: {
            role: "admin",
            emailVerified: true,
          },
        });
        console.log("✅ Admin user created via Better Auth.");
      }
    } catch (err) {
      console.log("Note on admin creation:", err);
      adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
    }
  } else {
    adminUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin", emailVerified: true },
    });
    console.log("✅ Existing admin user updated to role: admin.");
  }

  // 4. Create Demo Standard User via Better Auth API
  console.log("👤 Creating Demo Standard User...");
  const demoEmail = "user@asportfolio.com";
  const demoPassword = "User@#772800";

  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    try {
      const authRes = await auth.api.signUpEmail({
        body: {
          name: "Asmual Creator",
          email: demoEmail,
          password: demoPassword,
        },
      });

      if (authRes && authRes.user) {
        demoUser = await prisma.user.update({
          where: { id: authRes.user.id },
          data: {
            role: "user",
            emailVerified: true,
          },
        });
        console.log("✅ Demo user created via Better Auth.");
      }
    } catch (err) {
      console.log("Note on demo user creation:", err);
      demoUser = await prisma.user.findUnique({
        where: { email: demoEmail },
      });
    }
  }

  // 5. Seed Workspace, Portfolios and Custom Domains for Demo User
  if (demoUser) {
    console.log("📁 Seeding workspace & sample portfolios for demo user...");
    const workspace = await prisma.workspace.upsert({
      where: { slug: "asmual-workspace" },
      update: {},
      create: {
        name: "Asmual Studios",
        slug: "asmual-workspace",
        ownerId: demoUser.id,
      },
    });

    // Seed Active Pro Subscription for workspace
    await prisma.subscription.upsert({
      where: { workspaceId: workspace.id },
      update: {
        status: "ACTIVE",
        planId: "pro",
      },
      create: {
        workspaceId: workspace.id,
        planId: "pro",
        status: "ACTIVE",
        interval: "MONTHLY",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Seed Portfolio 1 (Published on subdomain)
    const portfolio1 = await prisma.portfolio.upsert({
      where: { subdomain: "asmual" },
      update: {
        isPublished: true,
      },
      create: {
        workspaceId: workspace.id,
        themeId: "modern-dev",
        title: "Asmual Portfolio - Full Stack Lead",
        subdomain: "asmual",
        isPublished: true,
        contentData: {
          hero: {
            title: "Senior Full Stack Architect & Designer",
            tagline: "Building scalable distributed SaaS platforms with TypeScript, Next.js & PostgreSQL",
            availability: "Open to High-Impact Opportunities",
          },
          about: {
            bio: "Passionate developer with 6+ years of engineering experience across React, Node.js, and cloud ecosystems.",
          },
          projects: [
            {
              id: "p1",
              title: "AS Portfolio Builder",
              category: "SaaS Platform",
              description: "Multi-tenant portfolio builder with instant live customizer, subdomains & custom domains.",
              techStack: ["Next.js 15", "TypeScript", "Prisma", "Supabase", "Tailwind CSS"],
              liveUrl: "https://asportfolio.site",
            },
            {
              id: "p2",
              title: "EcoBuild Architecture",
              category: "Web Application",
              description: "Sustainable architectural portfolio showcasing passive housing designs and green infrastructure.",
              techStack: ["React", "Three.js", "Tailwind CSS"],
              liveUrl: "https://ecobuild-studio.dev",
            },
          ],
          skills: [
            "Next.js", "React 19", "TypeScript", "Node.js", "PostgreSQL",
            "Tailwind CSS", "Prisma", "Docker", "GraphQL", "Redis"
          ],
        },
        styleConfig: {
          primaryColor: "#064B2B",
          accentColor: "#16803D",
          fontFamily: "Inter, sans-serif",
          darkMode: false,
          roundedCorners: "16px",
        },
      },
    });

    // Seed Custom Domain for Portfolio 1
    await prisma.customDomain.upsert({
      where: { portfolioId: portfolio1.id },
      update: {
        status: "ACTIVE",
        sslActive: true,
      },
      create: {
        portfolioId: portfolio1.id,
        domainName: "asmual.dev",
        status: "ACTIVE",
        sslActive: true,
        verifiedAt: new Date(),
      },
    });

    // Seed Portfolio 2 (Draft)
    await prisma.portfolio.upsert({
      where: { subdomain: "asmual-designer" },
      update: {},
      create: {
        workspaceId: workspace.id,
        themeId: "creative-designer",
        title: "Creative Visual Showcase 2026",
        subdomain: "asmual-designer",
        isPublished: false,
        contentData: {
          hero: {
            title: "UI/UX & Brand Identity Designer",
            tagline: "Designing meaningful digital products that delight users",
          },
        },
        styleConfig: {
          primaryColor: "#10291D",
          accentColor: "#16803D",
          fontFamily: "Poppins, sans-serif",
          darkMode: true,
          roundedCorners: "24px",
        },
      },
    });

    // Seed Portfolio 3 (Rohan Sharma - Creative Designer Live Demo)
    await prisma.portfolio.upsert({
      where: { subdomain: "rohan" },
      update: {
        isPublished: true,
        themeId: "creative-designer",
      },
      create: {
        workspaceId: workspace.id,
        themeId: "creative-designer",
        title: "Rohan Sharma - UI/UX Designer",
        subdomain: "rohan",
        isPublished: true,
        contentData: {
          hero: {
            title: "Rohan Sharma",
            tagline: "UI/UX Designer",
            headline: "HELLO, I'M",
            shortBio: "I craft intuitive digital experiences that are beautiful, functional and user-centered.",
          },
          about: {
            bio: "I'm a UI/UX Designer with 5+ years of experience crafting digital products that are intuitive, accessible and impactful. I believe in understanding user needs and turning ideas into seamless experiences.",
          },
        },
        styleConfig: {
          primaryColor: "#181716",
          accentColor: "#C25E34",
          fontFamily: "Playfair Display, serif",
          darkMode: true,
        },
      },
    });

    console.log("✅ Seeded demo workspace, active subscription, portfolios, and custom domains.");
  }

  console.log("\n🎉 Database Seeding Completed Successfully!");
  console.log("=================================================");
  console.log("👑 Admin Account: admin@asportfolio.com | Password: Admin@#772800 (Role: admin)");
  console.log("👤 Demo Account:  user@asportfolio.com  | Password: User@#772800  (Role: user)");
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
