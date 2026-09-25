// Runs once when the Next.js server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Open a few pooled DB connections up front. Each new connection to the database
  // costs ~1s (TLS handshake), which otherwise lands on the first portal visitor.
  const { prisma } = await import("./lib/prisma");
  Promise.all(Array.from({ length: 3 }, () => prisma.$queryRaw`SELECT 1`)).catch(
    () => {},
  );
}
