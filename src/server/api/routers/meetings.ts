import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const meetingsRouter = createTRPCRouter({
  getByFriend: publicProcedure
    .input(z.object({ friendId: z.string(), userId: z.string() }))
    .query(async ({ input }) => {
      return db.meeting.findMany({
        where: {
          friendId: input.friendId,
          userId: input.userId,
        },
        orderBy: { date: "desc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        date: z.coerce.date(),
        duration: z.number().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
        friendId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update friend's lastContact
      await db.friend.update({
        where: { id: input.friendId },
        data: { lastContact: input.date },
      });

      return db.meeting.create({
        data: {
          ...input,
          userId: ctx.session.user.id!,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        date: z.date().optional(),
        duration: z.number().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return db.meeting.updateMany({
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
      return db.meeting.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id!,
        },
      });
    }),
});
