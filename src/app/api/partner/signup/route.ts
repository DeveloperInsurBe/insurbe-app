import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function generatePartnerId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PRT${random}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      companyName,
      title,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = body;

    // Validation
    if (
      !companyName ||
      !title ||
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    // Password Match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 },
      );
    }

    // Existing User Check
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Already Partner
      if (existingUser.role === "partner") {
        return NextResponse.json(
          { message: "Partner account already exists" },
          { status: 409 },
        );
      }

      // Upgrade existing user to partner
      const updatedUser = await prisma.user.update({
        where: {
          email,
        },
        data: {
          companyName,
          title,
          firstName,
          lastName,

          role: "partner",

          partnerId: generatePartnerId(),
        },
      });

      return NextResponse.json(
        {
          message: "Partner account created successfully",
          partnerId: updatedUser.partnerId,
        },
        { status: 200 },
      );
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Partner
    const partner = await prisma.user.create({
      data: {
        companyName,
        title,
        firstName,
        lastName,
        email,
        password: hashedPassword,

        role: "partner",

        partnerId: generatePartnerId(),
      },
    });

    return NextResponse.json(
      {
        message: "Partner account created successfully",
        partnerId: partner.partnerId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("PARTNER SIGNUP ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
