import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const meetingsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        take: z.number().min(1).max(200).optional(),
        skip: z.number().min(0).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const take = input.take ?? 50;
      const skip = input.skip ?? 0;

      const [items, total] = await Promise.all([
        db.meeting.findMany({
          where: {
            userId: ctx.session.user.id,
          },
          orderBy: { date: "desc" },
          take,
          skip,
          include: {
            friend: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        db.meeting.count({
          where: {
            userId: ctx.session.user.id,
          },
        }),
      ]);

      return { items, total };
    }),

  getByFriend: publicProcedure
    .input(z.object({ friendId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id ?? "";
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Missing user in session.",
        });
      }

      return db.meeting.findMany({
        where: {
          friendId: input.friendId,
          userId,
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
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Missing user in session.",
        });
      }

      const friend = await db.friend.findFirst({
        where: {
          id: input.friendId,
          userId,
        },
        select: { id: true },
      });

      if (!friend) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Friend not found for this user.",
        });
      }

      await db.friend.update({
        where: { id: friend.id },
        data: { lastContact: input.date },
      });

      return db.meeting.create({
        data: {
          ...input,
          userId,
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
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Missing user in session.",
        });
      }

      return db.meeting.update({
        where: {
          id: input.id,
          userId,
        },
        data: input,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Missing user in session.",
        });
      }

      return db.meeting.delete({
        where: {
          id: input.id,
          userId,
        },
      });
    }),
});
