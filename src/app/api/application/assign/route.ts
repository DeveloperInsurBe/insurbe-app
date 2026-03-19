import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
//   const session = await getServerSession();
const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { applicationId } = body;

  // get logged-in user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  // 🔥 attach application to user
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      userId: user.id,
      status: "incomplete",
    },
  });

  return NextResponse.json({ success: true });
}