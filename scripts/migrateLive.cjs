/**
 * Runs `prisma migrate deploy` against the LIVE database.
 *
 * Local development uses the dev database from .env. The live database
 * settings live only in .env.live (git-ignored), so a normal `npx prisma ...`
 * can never touch live by accident. Usage: npm run migrate:live
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const readline = require("readline");
const dotenv = require("dotenv");

if (!fs.existsSync(".env.live")) {
  console.error("No .env.live file found. Live migrations need the live settings in .env.live.");
  process.exit(1);
}

const live = dotenv.parse(fs.readFileSync(".env.live"));
const local = fs.existsSync(".env") ? dotenv.parse(fs.readFileSync(".env")) : {};

if (!live.DATABASE_URL) {
  console.error(".env.live has no DATABASE_URL.");
  process.exit(1);
}
if (local.DATABASE_URL && local.DATABASE_URL === live.DATABASE_URL) {
  console.error("Your .env points at the live database too. Fix .env first (it should use the dev database).");
  process.exit(1);
}

const host = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.username}@${parsed.host}`;
  } catch {
    return "(unreadable url)";
  }
};

console.log("\nThis applies pending migrations to the LIVE database:");
console.log(`  ${host(live.DIRECT_URL || live.DATABASE_URL)}\n`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Type LIVE to continue: ', (answer) => {
  rl.close();
  if (answer.trim() !== "LIVE") {
    console.log("Cancelled. Nothing was changed.");
    process.exit(0);
  }
  // Variables already set in the environment win over .env for Prisma.
  const env = { ...process.env, DATABASE_URL: live.DATABASE_URL, DIRECT_URL: live.DIRECT_URL || live.DATABASE_URL };
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit", env, shell: true });
  process.exit(result.status ?? 1);
});
