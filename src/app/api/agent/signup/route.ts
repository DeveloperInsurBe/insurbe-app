import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { TEAM_ADMIN_ROLE } from "@/lib/team/roles";

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
      invite,
    } = body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (
      !firstName ||
      !lastName ||
      !normalizedEmail ||
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

    // Invite link of a team admin: the new agent joins that team.
    let teamAdminId: string | null = null;
    const inviteCode = String(invite || "").trim();
    if (inviteCode) {
      const teamAdmin = await prisma.user.findFirst({
        where: { role: TEAM_ADMIN_ROLE, inviteCode },
        select: { id: true },
      });
      if (!teamAdmin) {
        return NextResponse.json(
          { message: "This invite link is no longer valid. Please ask for a new one." },
          { status: 400 },
        );
      }
      teamAdminId = teamAdmin.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Never take over an existing account: signing up must not change another
    // user's password or role (customers, partners, admins, ...).
    if (existingUser) {
      return NextResponse.json(
        {
          message:
            existingUser.role === "agent"
              ? "Agent account already exists"
              : "An account with this email already exists. Please use another email or contact support@insurbe.com.",
        },
        { status: 409 },
      );
    }

    const agent = await prisma.user.create({
      data: {
        firstName,
        lastName,
        companyName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "agent",
        teamAdminId,
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
