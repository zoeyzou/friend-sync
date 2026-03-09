import { env } from "~/env";
import { type Prisma, PrismaClient } from "../../generated/prisma";
import { decryptAccountRecord, encryptAccountData } from "./account-encryption";

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  // Wrap the Account delegate to transparently encrypt/decrypt token fields.
  // Narrow account delegate shape to the methods we wrap.
  type AccountDelegateLike = {
    create: (args: Prisma.AccountCreateArgs) => Promise<unknown>;
    createMany: (args?: Prisma.AccountCreateManyArgs) => Promise<unknown>;
    update: (args: Prisma.AccountUpdateArgs) => Promise<unknown>;
    updateMany: (args: Prisma.AccountUpdateManyArgs) => Promise<unknown>;
    upsert: (args: Prisma.AccountUpsertArgs) => Promise<unknown>;
    findUnique: (args: Prisma.AccountFindUniqueArgs) => Promise<unknown>;
    findFirst: (args?: Prisma.AccountFindFirstArgs) => Promise<unknown>;
    findMany: (args?: Prisma.AccountFindManyArgs) => Promise<unknown>;
    delete: (args: Prisma.AccountDeleteArgs) => Promise<unknown>;
    deleteMany: (args?: Prisma.AccountDeleteManyArgs) => Promise<unknown>;
    aggregate: (args: Prisma.AccountAggregateArgs) => Promise<unknown>;
    groupBy: (args: Prisma.AccountGroupByArgs) => Promise<unknown>;
    count: (args: Prisma.AccountCountArgs) => Promise<unknown>;
  };

  const baseAccount = client.account as unknown as AccountDelegateLike;

  (client as unknown as { account: AccountDelegateLike }).account = {
    ...baseAccount,
    async create(args: Prisma.AccountCreateArgs) {
      const nextArgs: Prisma.AccountCreateArgs = {
        ...args,
        data: encryptAccountData(args.data),
      };
      const res = await baseAccount.create(nextArgs);
      return decryptAccountRecord(res as Record<string, unknown>);
    },
    async createMany(args?: Prisma.AccountCreateManyArgs) {
      const nextArgs: Prisma.AccountCreateManyArgs | undefined = args && {
        ...args,
        data: Array.isArray(args.data)
          ? args.data.map((d) => encryptAccountData(d))
          : encryptAccountData(args.data),
      };
      return baseAccount.createMany(nextArgs);
    },
    async update(args: Prisma.AccountUpdateArgs) {
      const nextArgs: Prisma.AccountUpdateArgs = {
        ...args,
        data: encryptAccountData(args.data),
      };
      const res = await baseAccount.update(nextArgs);
      return decryptAccountRecord(res as Record<string, unknown>);
    },
    async updateMany(args: Prisma.AccountUpdateManyArgs) {
      const nextArgs: Prisma.AccountUpdateManyArgs = {
        ...args,
        data: encryptAccountData(args.data),
      };
      return baseAccount.updateMany(nextArgs);
    },
    async upsert(args: Prisma.AccountUpsertArgs) {
      const nextArgs: Prisma.AccountUpsertArgs = {
        ...args,
        create: encryptAccountData(args.create),
        update: encryptAccountData(args.update),
      };
      const res = await baseAccount.upsert(nextArgs);
      return decryptAccountRecord(res as Record<string, unknown>);
    },
    async findUnique(args: Prisma.AccountFindUniqueArgs) {
      const res = await baseAccount.findUnique(args);
      return decryptAccountRecord(
        res as Record<string, unknown> | null | undefined,
      );
    },
    async findFirst(args?: Prisma.AccountFindFirstArgs) {
      const res = await baseAccount.findFirst(args);
      return decryptAccountRecord(
        res as Record<string, unknown> | null | undefined,
      );
    },
    async findMany(args?: Prisma.AccountFindManyArgs) {
      const res = await baseAccount.findMany(args);
      if (Array.isArray(res)) {
        return res.map((row) =>
          decryptAccountRecord(row as Record<string, unknown>),
        );
      }
      return res;
    },
    async delete(args: Prisma.AccountDeleteArgs) {
      return baseAccount.delete(args);
    },
    async deleteMany(args?: Prisma.AccountDeleteManyArgs) {
      return baseAccount.deleteMany(args);
    },
    async aggregate(args: Prisma.AccountAggregateArgs) {
      return baseAccount.aggregate(args);
    },
    async groupBy(args: Prisma.AccountGroupByArgs) {
      return baseAccount.groupBy(args);
    },
    async count(args: Prisma.AccountCountArgs) {
      return baseAccount.count(args);
    },
  };

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
