import { auth } from "../src/auth";

async function verifyAuth() {
  console.log("🔐 Testing Better Auth Sign In for Admin...");
  try {
    const adminRes = await auth.api.signInEmail({
      body: {
        email: "admin@asportfolio.com",
        password: "Admin@#772800",
      },
    });

    if (adminRes && adminRes.user) {
      console.log("✅ Admin Sign In SUCCESS:", {
        id: adminRes.user.id,
        email: adminRes.user.email,
        name: adminRes.user.name,
      });
    } else {
      console.error("❌ Admin Sign In returned unexpected result:", adminRes);
    }
  } catch (err: any) {
    console.error("❌ Admin Sign In Failed:", err?.message || err);
  }

  console.log("\n🔐 Testing Better Auth Sign In for Demo User...");
  try {
    const userRes = await auth.api.signInEmail({
      body: {
        email: "user@asportfolio.com",
        password: "User@#772800",
      },
    });

    if (userRes && userRes.user) {
      console.log("✅ User Sign In SUCCESS:", {
        id: userRes.user.id,
        email: userRes.user.email,
        name: userRes.user.name,
      });
    } else {
      console.error("❌ User Sign In returned unexpected result:", userRes);
    }
  } catch (err: any) {
    console.error("❌ User Sign In Failed:", err?.message || err);
  }
}

verifyAuth().then(() => process.exit(0));
