/**
 * Team admins (restricted admins) see and manage only the agents they
 * onboarded and the customers those agents brought in. The superadmin
 * (role "admin") keeps full visibility.
 */
export const TEAM_ADMIN_ROLE = "team_admin";

/** A team admin the superadmin switched off: cannot sign in anywhere. */
export const TEAM_ADMIN_DISABLED_ROLE = "team_admin_disabled";
