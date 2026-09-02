CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_partner_active_createdat_desc
ON "Application" ("partnerId", "createdAt" DESC)
WHERE "source" = 'partner' AND "status" <> 'incomplete';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_partner_active_commstatus_createdat
ON "Application" ("partnerId", "commissionStatus", "createdAt" DESC)
WHERE "source" = 'partner' AND "status" <> 'incomplete';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_agent_nonclient_createdat_desc
ON "Application" ("partnerId", "createdAt" DESC)
WHERE "source" = 'agent' AND "status" <> 'client_profile';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_agent_clientprofile_userid
ON "Application" ("partnerId", "userId")
WHERE "source" = 'agent' AND "status" = 'client_profile';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_source_partner_status
ON "Application" ("source", "partnerId", "status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_app_source_commissionstatus
ON "Application" ("source", "commissionStatus");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_role_createdat_desc
ON "User" ("role", "createdAt" DESC);
