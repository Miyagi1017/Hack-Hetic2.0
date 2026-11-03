import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../src/lib/prisma.js";
import { getSession, requireAuth } from "../../src/lib/auth.js";
import { apiSuccess, apiError, handleApiError, paginate } from "../../src/lib/api.js";

const router = Router();

const createSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budgetAmount: z.number().positive().optional(),
  budgetCurrency: z.string().default("EUR"),
  travelPace: z.enum(["relaxed", "balanced", "packed"]).default("balanced"),
  preferredTimezone: z.string().default("UTC"),
  visibility: z.enum(["private", "shared", "public"]).default("private"),
});

const patchSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budgetAmount: z.number().positive().optional().nullable(),
  budgetCurrency: z.string().optional(),
  travelPace: z.enum(["relaxed", "balanced", "packed"]).optional(),
  status: z.enum(["draft", "planning", "confirmed", "completed", "cancelled"]).optional(),
  visibility: z.enum(["private", "shared", "public"]).optional(),
});

async function getTripAndCheckAccess(tripId: string, userId: string, requireOwner = false) {
  return prisma.trip.findFirst({
    where: {
      id: tripId,
      deletedAt: null,
      OR: requireOwner
        ? [{ ownerId: userId }]
        : [
            { ownerId: userId },
            { members: { some: { userId, invitationStatus: "accepted" } } },
          ],
    },
    include: {
      locations: { orderBy: { sequenceNumber: "asc" } },
      members: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } },
      _count: { select: { itineraryItems: true, issues: true } },
    },
  });
}

// GET /api/v1/trips
router.get("/", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return apiError(res, "Unauthorized", 401);

    const { skip, take } = paginate(req.query as Record<string, string>);
    const status = req.query.status as string | undefined;

    const where = {
      OR: [
        { ownerId: session.userId },
        { members: { some: { userId: session.userId, invitationStatus: "accepted" } } },
      ],
      deletedAt: null as null,
      ...(status ? { status } : {}),
    };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          _count: { select: { itineraryItems: true, members: true, issues: true } },
          locations: { orderBy: { sequenceNumber: "asc" }, take: 3 },
        },
        orderBy: { startDate: "asc" },
        skip,
        take,
      }),
      prisma.trip.count({ where }),
    ]);

    return apiSuccess(res, { trips, total, page: Math.floor(skip / take) + 1, limit: take });
  } catch (e) {
    return handleApiError(res, e);
  }
});

// POST /api/v1/trips
router.post("/", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return apiError(res, "Unauthorized", 401);

    const data = createSchema.parse(req.body);
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return apiError(res, "End date must be after start date");
    }

    const trip = await prisma.trip.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        ownerId: session.userId,
      },
    });

    return apiSuccess(res, trip, 201);
  } catch (e) {
    return handleApiError(res, e);
  }
});

// GET /api/v1/trips/:tripId
router.get("/:tripId", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return apiError(res, "Unauthorized", 401);

    const trip = await getTripAndCheckAccess(req.params.tripId, session.userId);
    if (!trip) return apiError(res, "Not found", 404);

    return apiSuccess(res, trip);
  } catch (e) {
    return handleApiError(res, e);
  }
});

// PATCH /api/v1/trips/:tripId
router.patch("/:tripId", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return apiError(res, "Unauthorized", 401);

    const existing = await getTripAndCheckAccess(req.params.tripId, session.userId, true);
    if (!existing) return apiError(res, "Not found", 404);

    const data = patchSchema.parse(req.body);
    const trip = await prisma.trip.update({
      where: { id: req.params.tripId },
      data: {
        ...data,
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
      },
    });

    return apiSuccess(res, trip);
  } catch (e) {
    return handleApiError(res, e);
  }
});

// DELETE /api/v1/trips/:tripId
router.delete("/:tripId", async (req, res) => {
  try {
    const session = await requireAuth(req);

    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, ownerId: session.userId, deletedAt: null },
    });
    if (!trip) return apiError(res, "Not found", 404);

    await prisma.trip.update({ where: { id: req.params.tripId }, data: { deletedAt: new Date() } });
    return apiSuccess(res, { message: "Trip deleted" });
  } catch (e) {
    return handleApiError(res, e);
  }
});

// GET /api/v1/trips/:tripId/itinerary
router.get("/:tripId/itinerary", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) return apiError(res, "Unauthorized", 401);

    const trip = await getTripAndCheckAccess(req.params.tripId, session.userId);
    if (!trip) return apiError(res, "Not found", 404);

    const items = await prisma.itineraryItem.findMany({
      where: { tripId: req.params.tripId },
      include: {
        place: true,
        activity: true,
        issues: true,
      },
      orderBy: { startAt: "asc" },
    });

    return apiSuccess(res, items);
  } catch (e) {
    return handleApiError(res, e);
  }
});

export default router;
