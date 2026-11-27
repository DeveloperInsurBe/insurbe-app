/**
 * Fills the DEV database with test accounts, one per role. Never runs against
 * the live database. Usage: npm run seed:dev
 *
 * You type one password; every test account gets it. Emails use the
 * reserved .test domain, so no real person ever receives mail for them.
 */
const fs = require("fs");
const readline = require("readline");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const env = dotenv.parse(fs.readFileSync(".env"));
const live = fs.existsSync(".env.live") ? dotenv.parse(fs.readFileSync(".env.live")) : {};

const projectRef = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.username}@${parsed.host}`;
  } catch {
    return "";
  }
};

/** Supabase project id from a database url: "postgres.<ref>@…pooler…" or "…@db.<ref>.supabase.co". */
const supabaseRef = (url) => {
  try {
    const parsed = new URL(url);
    const fromUser = parsed.username.split(".")[1];
    const fromHost = parsed.host.startsWith("db.") ? parsed.host.split(".")[1] : "";
    return fromUser || fromHost || "";
  } catch {
    return "";
  }
};

// Refuse to touch the live database.
const liveRefs = [live.DATABASE_URL, live.DIRECT_URL].map(supabaseRef).filter(Boolean);
const target = env.DIRECT_URL || env.DATABASE_URL || "";
const targetRef = supabaseRef(target);
if (!target || !targetRef || (live.DATABASE_URL && (target === live.DATABASE_URL || target === live.DIRECT_URL))) {
  console.error("ABORT: .env points at the live database. Seeding only runs on the dev database.");
  process.exit(1);
}
if (liveRefs.includes(targetRef)) {
  console.error("ABORT: .env looks like the live project. Seeding only runs on the dev database.");
  process.exit(1);
}

const ACCOUNTS = [
  { email: "admin@insurbe.test", role: "admin", firstName: "Test", lastName: "Admin" },
  { email: "partner@insurbe.test", role: "partner", firstName: "Test", lastName: "Partner", companyName: "Test University", partnerId: "PRT900001", partnerCategory: "referral" },
  { email: "agent@insurbe.test", role: "agent", firstName: "Test", lastName: "Agent", companyName: "Test Agency", partnerCategory: "agent" },
  { email: "salesleader@insurbe.test", role: "team_admin", firstName: "Test", lastName: "SalesLeader", commissionLimit: 20, inviteCode: "devinvite001" },
  { email: "reviewer@insurbe.test", role: "dak_reviewer", firstName: "Test", lastName: "Reviewer" },
  { email: "customer@insurbe.test", role: "user", firstName: "Test", lastName: "Customer" },
];

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log(`\nSeeding the DEV database: ${projectRef(target)}`);
rl.question("Password for all test accounts (min. 8 characters): ", async (password) => {
  rl.close();
  if (!password || password.length < 8) {
    console.error("The password must be at least 8 characters. Nothing was changed.");
    process.exit(1);
  }

  const prisma = new PrismaClient({ datasources: { db: { url: target } } });
  try {
    const hash = await bcrypt.hash(password, 10);
    for (const account of ACCOUNTS) {
      const { email, ...data } = account;
      await prisma.user.upsert({
        where: { email },
        update: { ...data, password: hash },
        create: { email, ...data, password: hash },
      });
      console.log(`  ✓ ${account.role.padEnd(12)} ${email}`);
    }

    // The test partner joins the test Sales Leader's team.
    const leader = await prisma.user.findUnique({ where: { email: "salesleader@insurbe.test" }, select: { id: true } });
    await prisma.user.update({ where: { email: "partner@insurbe.test" }, data: { teamAdminId: leader.id } });

    for (const [role, rate] of [["partner", 5], ["agent", 30]]) {
      await prisma.commissionDefault.upsert({ where: { role }, update: {}, create: { role, rate, updatedBy: "seed:dev" } });
    }
    console.log("  ✓ commission defaults (partner €5, agent €30)\n\nDone. Sign in with these emails and the password you typed.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
});
