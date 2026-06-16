import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function parseAdditionalInfo(input?: string | null) {
  if (!input) return {};
  try {
    return JSON.parse(input) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== "agent") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { partnerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const info = parseAdditionalInfo(user.partnerProfile?.additionalInfo);

    return NextResponse.json({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      companyName: user.companyName || "",
      email: user.email || "",
      brokerType: user.partnerProfile?.position || "",
      countryCode: user.partnerProfile?.countryCode || "+49",
      phone: user.partnerProfile?.phone || "",
      licenseNumber: (info.licenseNumber as string) || "",
      licenseAuthority: (info.licenseAuthority as string) || "",
      businessRegistrationNo: (info.businessRegistrationNo as string) || "",
      verificationStatus:
        (info.verificationStatus as string) || "draft",
      agreementAccepted: Boolean(info.agreementAccepted),
    });
  } catch (error) {
    console.error("AGENT PROFILE GET ERROR:", error);
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

    const {
      firstName,
      lastName,
      companyName,
      brokerType,
      countryCode,
      phone,
      licenseNumber,
      licenseAuthority,
      businessRegistrationNo,
      verificationStatus,
      agreementAccepted,
    } = body || {};

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName || "",
        lastName: lastName || "",
        companyName: companyName || "",
      },
    });

    const additionalInfo = JSON.stringify({
      licenseNumber: licenseNumber || "",
      licenseAuthority: licenseAuthority || "",
      businessRegistrationNo: businessRegistrationNo || "",
      verificationStatus: verificationStatus || "draft",
      agreementAccepted: Boolean(agreementAccepted),
    });

    await prisma.partnerProfile.upsert({
      where: { userId: user.id },
      update: {
        position: brokerType || "",
        countryCode: countryCode || "+49",
        phone: phone || "",
        additionalInfo,
      },
      create: {
        userId: user.id,
        position: brokerType || "",
        countryCode: countryCode || "+49",
        phone: phone || "",
        additionalInfo,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AGENT PROFILE POST ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

