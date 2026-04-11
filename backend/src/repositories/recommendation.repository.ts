import prisma from '../config/prisma';
import { RecType } from '@prisma/client';

export async function create(data: {
  userId: string;
  recType: RecType;
  message: string;
  appliedRules: object;
}) {
  return prisma.recommendation.create({ data });
}

export async function findUnreadByUser(userId: string) {
  return prisma.recommendation.findMany({
    where: { userId, isRead: false },
    orderBy: { generatedAt: 'desc' },
  });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.recommendation.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });
}

export async function findByUserSince(userId: string, since: Date) {
  return prisma.recommendation.findMany({
    where: { userId, generatedAt: { gte: since } },
  });
}
