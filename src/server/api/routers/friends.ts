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
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          reminderDays: true,
          lastContact: true,
          createdAt: true,
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
});
