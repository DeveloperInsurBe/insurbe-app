import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function makeOrderId() {
  return `AGAPP-${Date.now()}`;
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
        status: { not: "client_profile" },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        userId: true,
        product: true,
        status: true,
        commission: true,
        commissionStatus: true,
      },
    });

    return NextResponse.json(
      rows.map((item) => ({
        id: item.id,
        createdAt: item.createdAt.toISOString(),
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        email: item.userId || "",
        product: item.product || "",
        status: item.status,
        commission: item.commission || 0,
        commissionStatus: item.commissionStatus || "Pending",
      })),
    );
  } catch (error) {
    console.error("AGENT APPLICATIONS GET ERROR:", error);
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
    const { clientEmail, product } = body || {};

    if (!clientEmail || !product) {
      return NextResponse.json(
        { error: "clientEmail and product are required" },
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

    const clientProfile = await prisma.application.findFirst({
      where: {
        source: "agent",
        partnerId: agent.id,
        status: "client_profile",
        userId: clientEmail,
      },
      select: {
        firstName: true,
        lastName: true,
        userId: true,
      },
    });

    if (!clientProfile) {
      return NextResponse.json(
        { error: "Client profile not found. Add client first." },
        { status: 404 },
      );
    }

    const created = await prisma.application.create({
      data: {
        orderId: makeOrderId(),
        userId: clientProfile.userId,
        partnerId: agent.id,
        source: "agent",
        firstName: clientProfile.firstName,
        lastName: clientProfile.lastName,
        product,
        status: "created",
        commission: 30,
        commissionStatus: "Pending",
        pdfBase64: "",
      },
      select: {
        id: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        userId: true,
        product: true,
        status: true,
        commission: true,
        commissionStatus: true,
      },
    });

    return NextResponse.json({
      id: created.id,
      createdAt: created.createdAt.toISOString(),
      firstName: created.firstName || "",
      lastName: created.lastName || "",
      email: created.userId || "",
      product: created.product || "",
      status: created.status,
      commission: created.commission || 0,
      commissionStatus: created.commissionStatus || "Pending",
    });
  } catch (error) {
    console.error("AGENT APPLICATIONS POST ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body || {};

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const agent = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const current = await prisma.application.findFirst({
      where: { id, source: "agent", partnerId: agent.id },
      select: { id: true },
    });

    if (!current) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("AGENT APPLICATIONS PATCH ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

