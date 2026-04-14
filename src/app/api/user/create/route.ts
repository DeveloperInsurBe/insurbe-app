import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ✅ helper inside backend
function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  const all = upper + lower + numbers + special;

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 4; i < 10; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    // 🔥 generate here (single source of truth)
    const password = generatePassword();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
      
        password: hashedPassword,
      },
    });

    return Response.json({
      success: true,
      user,
      password, // 🔥 return plain password
    });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false });
  }
}