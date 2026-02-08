import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { differenceInDays } from "date-fns";

export const remindersRouter = createTRPCRouter({
  /**
   * 1. generateAll - OVERDUE FRIENDS SUMMARY
   * DB: Conservative 60d filter → JS: Precise overdue check
   */
  generateAll: protectedProcedure.mutation(async ({ ctx }) => {
    const today = new Date();
    const conservativeCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60d ago

    // DB: Pre-filter potentially overdue (fast)
    const candidates = await db.friend.findMany({
      where: {
        userId: ctx.session.user.id,
        lastContact: { lte: conservativeCutoff }, // Fast index scan
      },
      take: 200, // Small set for JS
    });

    // JS: Precise calculation (200 records = instant)
    const overdue: Array<{
      friendId: string;
      friendName: string;
      overdueBy: number;
      message: string;
    }> = [];

    for (const friend of candidates) {
      const daysSince = differenceInDays(today, friend.lastContact!);
      if (daysSince >= friend.reminderDays) {
        overdue.push({
          friendId: friend.id,
          friendName: friend.name,
          overdueBy: daysSince - friend.reminderDays,
          message: `Reach out to ${friend.name}! (${Math.round(daysSince)} days)`,
        });
      }
    }

    return {
      totalFriends: await db.friend.count({
        where: { userId: ctx.session.user.id },
      }),
      candidatesChecked: candidates.length,
      overdueCount: overdue.length,
      overdue,
    };
  }),

  /**
   * 2. overdueFriends - PAGINATED OVERDUE LIST
   * DB: 30d filter → JS: Sort/refine → Take exact page
   */
  overdueFriends: protectedProcedure
    .input(
      z.object({
        take: z.number().min(1).max(50).default(20),
        skip: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const today = new Date();
      const conservativeCutoff = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ); // 30d

      // DB: Overfetch for pagination buffer
      const candidates = await db.friend.findMany({
        where: {
          userId: ctx.session.user.id,
          lastContact: { lte: conservativeCutoff },
        },
        orderBy: { lastContact: "asc" }, // Most overdue first
        take: input.take + input.skip + 10, // Buffer
        skip: 0,
        include: {
          _count: { select: { meetings: true } },
        },
      });

      // JS: Precise overdue + pagination
      const overdueFriends = candidates
        .map((friend) => {
          const daysSince = differenceInDays(today, friend.lastContact!);
          return {
            ...friend,
            daysSince,
            daysOverdue: daysSince - friend.reminderDays,
            isOverdue: daysSince >= friend.reminderDays,
          };
        })
        .filter((friend) => friend.isOverdue)
        .slice(input.skip, input.skip + input.take);

      const totalOverdue = overdueFriends.length;

      return {
        friends: overdueFriends,
        totalOverdue,
        pageInfo: {
          hasNextPage: overdueFriends.length === input.take,
          nextCursor: overdueFriends[overdueFriends.length - 1]?.id,
        },
      };
    }),

  /**
   * 3. stats - DASHBOARD METRICS
   * DB: Aggregations → JS: Formatting
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // DB: All aggregations in 1 query
    const [counts, overdueFriends] = await Promise.all([
      db.friend.aggregate({
        where: { userId: ctx.session.user.id },
        _count: { id: true },
        _avg: { reminderDays: true },
      }),
      db.friend.count({
        where: {
          userId: ctx.session.user.id,
          lastContact: {
            lte: thirtyDaysAgo, // DB handles date math
          },
        },
      }),
    ]);

    // Recent activity
    const recentMeetings = await db.meeting.count({
      where: {
        userId: ctx.session.user.id,
        date: { gte: thirtyDaysAgo },
      },
    });

    return {
      totalFriends: counts._count.id,
      avgReminderDays: Math.round(counts._avg.reminderDays || 0),
      overdueCount: overdueFriends,
      activeThisMonth: recentMeetings,
      overduePercentage:
        Math.round((overdueFriends / counts._count.id) * 100) || 0,
    };
  }),

  /**
   * 4. markContacted - BULK UPDATE
   * Single atomic transaction
   */
  markContacted: protectedProcedure
    .input(z.object({ friendIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date();

      return await db.$transaction(
        input.friendIds.map((friendId) => {
          // Update lastContact + reset reminders
          return db.friend.update({
            where: { id: friendId },
            data: {
              lastContact: today,
              reminderDays: { decrement: 1 }, // Gamify!
            },
            include: {
              _count: { select: { meetings: true } },
            },
          });
        }),
      );
    }),
});
