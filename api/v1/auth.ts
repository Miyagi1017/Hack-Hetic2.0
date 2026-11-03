import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../src/lib/prisma.js";
import { hashPassword, verifyPassword } from "../../src/lib/password.js";
import { generateToken, sessionExpiresAt } from "../../src/lib/tokens.js";
import { apiSuccess, apiError, handleApiError } from "../../src/lib/api.js";
import { requireAuth } from "../../src/lib/auth.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(80),
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return apiError(res, "Invalid credentials", 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return apiError(res, "Invalid credentials", 401);

    const token = generateToken();
    const expiresAt = sessionExpiresAt();

    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return apiSuccess(res, { id: user.id, email: user.email, displayName: user.displayName });
  } catch (e) {
    return handleApiError(res, e);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, displayName } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return apiError(res, "Email already registered", 409);

    const passwordHash = await hashPassword(password);
    const token = generateToken();
    const expiresAt = sessionExpiresAt();

    const user = await prisma.user.create({ data: { email, passwordHash, displayName } });
    await prisma.userPreferences.create({ data: { userId: user.id } });
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return apiSuccess(res, { id: user.id, email: user.email, displayName: user.displayName }, 201);
  } catch (e) {
    return handleApiError(res, e);
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.session;
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    res.clearCookie("session", { path: "/" });
    return apiSuccess(res, null);
  } catch (e) {
    return handleApiError(res, e);
  }
});

router.get("/me", async (req, res) => {
  try {
    const session = await requireAuth(req);
    return apiSuccess(res, {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      avatarUrl: session.user.avatarUrl,
    });
  } catch (e) {
    return handleApiError(res, e);
  }
});

export default router;
