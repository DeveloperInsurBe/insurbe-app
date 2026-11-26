import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { SHOW_PARTNER_CATEGORIES } from "@/lib/partnerCategory";
import { INVALID_INVITE_MESSAGE, resolveTeamInvite } from "@/lib/team/invite";

export async function POST(req: Request) {
  // New agent accounts are closed while the signup page only offers partner accounts.
  if (!SHOW_PARTNER_CATEGORIES) {
    return NextResponse.json(
      { message: "Agent signup is currently closed. Please sign up as a partner." },
      { status: 403 },
    );
  }

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

    // Invite link of a Sales Leader: the new agent joins that team.
    const teamAdminId = await resolveTeamInvite(invite);
    if (teamAdminId === null) {
      return NextResponse.json({ message: INVALID_INVITE_MESSAGE }, { status: 400 });
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
        partnerCategory: "agent",
        teamAdminId: teamAdminId ?? null,
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
