-- =============================================================================
-- AS PORTFOLIO BUILDER - ROW LEVEL SECURITY (RLS) POLICIES
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "theme" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "portfolio" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_domain" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription" ENABLE ROW LEVEL SECURITY;

-- 2. Allow Backend Server (postgres & service_role) Full Unrestricted Access
-- Prisma connecting with postgres user will have full access seamlessly
CREATE POLICY "service_role_full_access_user" ON "user" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_session" ON "session" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_account" ON "account" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_verification" ON "verification" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_workspace" ON "workspace" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_theme" ON "theme" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_portfolio" ON "portfolio" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_custom_domain" ON "custom_domain" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_plan" ON "plan" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);
CREATE POLICY "service_role_full_access_subscription" ON "subscription" FOR ALL TO service_role, postgres USING (true) WITH CHECK (true);

-- 3. Public Read Policies for Public Catalog & Live Websites
-- Anyone can view available themes and pricing plans
CREATE POLICY "public_read_themes" ON "theme" FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_plans" ON "plan" FOR SELECT TO anon, authenticated USING (true);

-- Anyone can view published portfolios via subdomain or custom domain
CREATE POLICY "public_read_published_portfolios" ON "portfolio" FOR SELECT TO anon, authenticated USING ("isPublished" = true);
CREATE POLICY "public_read_verified_domains" ON "custom_domain" FOR SELECT TO anon, authenticated USING ("status" = 'ACTIVE' OR "sslActive" = true);

-- 4. User Workspace Ownership Policies (Role-Based Access)
-- Authenticated users can view and manage their own workspaces
CREATE POLICY "owner_manage_workspaces" ON "workspace"
  FOR ALL TO authenticated
  USING ("ownerId" = auth.uid()::text)
  WITH CHECK ("ownerId" = auth.uid()::text);

-- Users can manage portfolios belonging to workspaces they own
CREATE POLICY "owner_manage_portfolios" ON "portfolio"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "workspace"
      WHERE "workspace"."id" = "portfolio"."workspaceId"
      AND "workspace"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "workspace"
      WHERE "workspace"."id" = "portfolio"."workspaceId"
      AND "workspace"."ownerId" = auth.uid()::text
    )
  );

-- Users can manage custom domains for their own portfolios
CREATE POLICY "owner_manage_custom_domains" ON "custom_domain"
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "portfolio"
      JOIN "workspace" ON "workspace"."id" = "portfolio"."workspaceId"
      WHERE "portfolio"."id" = "custom_domain"."portfolioId"
      AND "workspace"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "portfolio"
      JOIN "workspace" ON "workspace"."id" = "portfolio"."workspaceId"
      WHERE "portfolio"."id" = "custom_domain"."portfolioId"
      AND "workspace"."ownerId" = auth.uid()::text
    )
  );
