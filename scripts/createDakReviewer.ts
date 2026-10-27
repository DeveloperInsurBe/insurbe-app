import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Creates (or resets the password of) a DAK provider portal reviewer.
async function main() {
  const email = process.env.DAK_REVIEWER_EMAIL?.trim().toLowerCase();
  const password = process.env.DAK_REVIEWER_PASSWORD;
  const firstName = process.env.DAK_REVIEWER_FIRST_NAME?.trim() || null;
  const lastName = process.env.DAK_REVIEWER_LAST_NAME?.trim() || null;

  if (!email || !password) {
    throw new Error("Set DAK_REVIEWER_EMAIL and DAK_REVIEWER_PASSWORD before running.");
  }
  if (password.length < 12) {
    throw new Error("DAK_REVIEWER_PASSWORD must have at least 12 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role && existing.role !== "dak_reviewer") {
    throw new Error(`${email} already exists with role "${existing.role}". Use another email.`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, password: hashedPassword, role: "dak_reviewer", firstName, lastName },
    update: {
      password: hashedPassword,
      role: "dak_reviewer",
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    },
  });

  console.log(`DAK reviewer ready: ${user.email} (${user.role})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
