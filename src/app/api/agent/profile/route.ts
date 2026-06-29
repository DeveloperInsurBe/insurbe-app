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

    const profile = user.partnerProfile;
    const info = parseAdditionalInfo(profile?.additionalInfo);

    return NextResponse.json({
      title: profile?.title || user.title || "Mr",
      position: profile?.position || "",
      brokerType: profile?.position || "",
      firstName: profile?.firstName || user.firstName || "",
      lastName: profile?.lastName || user.lastName || "",
      countryCode: profile?.countryCode || "+49",
      phone: profile?.phone || "",
      email: profile?.email || user.email || "",
      companyName: profile?.companyName || user.companyName || "",
      companyDescription: profile?.companyDescription || "",
      addressType: profile?.addressType || "overseas",
      streetName: profile?.streetName || "",
      streetNumber: profile?.streetNumber || "",
      postalCode: profile?.postalCode || "",
      city: profile?.city || "",
      careOfAddress: profile?.careOfAddress || "",
      country: profile?.country || "",
      accountHolder: profile?.accountHolder || "",
      recipientStreet: profile?.recipientStreet || "",
      recipientZip: profile?.recipientZip || "",
      recipientCity: profile?.recipientCity || "",
      recipientCountry: profile?.recipientCountry || "",
      iban: profile?.iban || "",
      bicSwift: profile?.bicSwift || "",
      currency: profile?.currency || "EUR",
      additionalInfo: profile?.additionalInfo || "",
      licenseNumber: (info.licenseNumber as string) || "",
      licenseAuthority: (info.licenseAuthority as string) || "",
      businessRegistrationNo: (info.businessRegistrationNo as string) || "",
      verificationStatus: (info.verificationStatus as string) || "draft",
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { partnerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const {
      title,
      position,
      brokerType,
      firstName,
      lastName,
      countryCode,
      phone,
      email,
      companyName,
      companyDescription,
      addressType,
      streetName,
      streetNumber,
      postalCode,
      city,
      careOfAddress,
      country,
      accountHolder,
      recipientStreet,
      recipientZip,
      recipientCity,
      recipientCountry,
      iban,
      bicSwift,
      currency,
      additionalInfo,
      licenseNumber,
      licenseAuthority,
      businessRegistrationNo,
      verificationStatus,
      agreementAccepted,
    } = body || {};

    await prisma.user.update({
      where: { id: user.id },
      data: {
        title: title || user.title || "",
        firstName: firstName || "",
        lastName: lastName || "",
        companyName: companyName || "",
      },
    });

    const existingInfo = parseAdditionalInfo(user.partnerProfile?.additionalInfo);
    const mergedAdditionalInfo = {
      ...existingInfo,
      ...(typeof additionalInfo === "string" && additionalInfo.trim()
        ? parseAdditionalInfo(additionalInfo)
        : {}),
      licenseNumber:
        licenseNumber ?? (existingInfo.licenseNumber as string) ?? "",
      licenseAuthority:
        licenseAuthority ?? (existingInfo.licenseAuthority as string) ?? "",
      businessRegistrationNo:
        businessRegistrationNo ??
        (existingInfo.businessRegistrationNo as string) ??
        "",
      verificationStatus:
        verificationStatus ?? (existingInfo.verificationStatus as string) ?? "draft",
      agreementAccepted:
        agreementAccepted ?? Boolean(existingInfo.agreementAccepted),
    };

    const profile = await prisma.partnerProfile.upsert({
      where: { userId: user.id },
      update: {
        title: title || "",
        position: position || brokerType || "",
        firstName: firstName || "",
        lastName: lastName || "",
        countryCode: countryCode || "+49",
        phone: phone || "",
        email: email || user.email || "",
        companyName: companyName || "",
        companyDescription: companyDescription || "",
        addressType: addressType || "overseas",
        streetName: streetName || "",
        streetNumber: streetNumber || "",
        postalCode: postalCode || "",
        city: city || "",
        careOfAddress: careOfAddress || "",
        country: country || "",
        accountHolder: accountHolder || "",
        recipientStreet: recipientStreet || "",
        recipientZip: recipientZip || "",
        recipientCity: recipientCity || "",
        recipientCountry: recipientCountry || "",
        iban: iban || "",
        bicSwift: bicSwift || "",
        currency: currency || "EUR",
        additionalInfo: JSON.stringify(mergedAdditionalInfo),
      },
      create: {
        userId: user.id,
        title: title || "",
        position: position || brokerType || "",
        firstName: firstName || "",
        lastName: lastName || "",
        countryCode: countryCode || "+49",
        phone: phone || "",
        email: email || user.email || "",
        companyName: companyName || "",
        companyDescription: companyDescription || "",
        addressType: addressType || "overseas",
        streetName: streetName || "",
        streetNumber: streetNumber || "",
        postalCode: postalCode || "",
        city: city || "",
        careOfAddress: careOfAddress || "",
        country: country || "",
        accountHolder: accountHolder || "",
        recipientStreet: recipientStreet || "",
        recipientZip: recipientZip || "",
        recipientCity: recipientCity || "",
        recipientCountry: recipientCountry || "",
        iban: iban || "",
        bicSwift: bicSwift || "",
        currency: currency || "EUR",
        additionalInfo: JSON.stringify(mergedAdditionalInfo),
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("AGENT PROFILE POST ERROR:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

