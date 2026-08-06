import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
<<<<<<< HEAD
    log: process.env.NODE_ENV !== 'production' ? ['query', 'warn', 'error'] : ['error'],
=======
    log: ['query'],
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
