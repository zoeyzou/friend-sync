import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const friendsRouter = createTRPCRouter({
  // Server-side friendly
  getAll: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return db.friend.findMany({
        where: { userId: input.userId },
        orderBy: { lastContact: "desc" },
        include: {
          _count: { select: { meetings: true } },
          meetings: {
            orderBy: { date: "desc" },
            take: 3,
            select: { id: true, title: true, date: true },
          },
        },
      });
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .query(async ({ input }) => {
      return db.friend.findFirst({
        where: {
          id: input.id,
          userId: input.userId,
        },
        include: {
          meetings: {
            orderBy: { date: "desc" },
            take: 10,
          },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        reminderDays: z.coerce.number().min(1).max(365).default(30),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.friend.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        reminderDays: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return db.friend.updateMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id!,
        },
        data: input,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return db.friend.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id!,
        },
      });
    }),
});
