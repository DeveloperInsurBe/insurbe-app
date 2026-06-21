import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      companyName,
      brokerType,
    } = body || {};

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !companyName
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role === "agent") {
        return NextResponse.json(
          { message: "Agent account already exists" },
          { status: 409 },
        );
      }

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          firstName,
          lastName,
          companyName,
          password: hashedPassword,
          role: "agent",
        },
      });

      if (brokerType) {
        await prisma.partnerProfile.upsert({
          where: { userId: updatedUser.id },
          update: { position: brokerType },
          create: { userId: updatedUser.id, position: brokerType },
        });
      }

      return NextResponse.json(
        { message: "Agent account created successfully", email: updatedUser.email },
        { status: 200 },
      );
    }

    const agent = await prisma.user.create({
      data: {
        firstName,
        lastName,
        companyName,
        email,
        password: hashedPassword,
        role: "agent",
      },
    });

    if (brokerType) {
      await prisma.partnerProfile.upsert({
        where: { userId: agent.id },
        update: { position: brokerType },
        create: { userId: agent.id, position: brokerType },
      });
    }

    return NextResponse.json(
      { message: "Agent account created successfully", email: agent.email },
      { status: 201 },
    );
  } catch (error) {
    console.error("AGENT SIGNUP ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
