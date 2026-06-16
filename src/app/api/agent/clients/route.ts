import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function makeOrderId() {
  return `AGCL-${Date.now()}`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agent = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const rows = await prisma.application.findMany({
      where: {
        source: "agent",
        partnerId: agent.id,
        status: "client_profile",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        userId: true,
      },
    });

    return NextResponse.json(
      rows.map((item) => ({
        id: item.id,
        createdAt: item.createdAt.toISOString(),
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        email: item.userId || "",
      })),
    );
  } catch (error) {
    console.error("AGENT CLIENTS GET ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, email } = body || {};

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName and email are required" },
        { status: 400 },
      );
    }

    const agent = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const existing = await prisma.application.findFirst({
      where: {
        source: "agent",
        partnerId: agent.id,
        status: "client_profile",
        userId: email,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Client already exists" },
        { status: 409 },
      );
    }

    const created = await prisma.application.create({
      data: {
        orderId: makeOrderId(),
        userId: email,
        partnerId: agent.id,
        source: "agent",
        status: "client_profile",
        firstName,
        lastName,
        product: "Client Profile",
        commission: 0,
        commissionStatus: "Not Eligible",
        pdfBase64: "",
      },
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        userId: true,
      },
    });

    return NextResponse.json({
      id: created.id,
      createdAt: created.createdAt.toISOString(),
      firstName: created.firstName || "",
      lastName: created.lastName || "",
      email: created.userId || "",
    });
  } catch (error) {
    console.error("AGENT CLIENTS POST ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

