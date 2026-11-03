import type { Request } from "express";
import { prisma } from "./prisma.js";

export async function getSession(req: Request) {
  const token = req.cookies?.session;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { preferences: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;
  return session;
}

export async function requireAuth(req: Request) {
  const session = await getSession(req);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSession>>>["user"];
