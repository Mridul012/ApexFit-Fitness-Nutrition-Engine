import prisma from '../config/prisma';

export async function create(data: {
  userId: string;
  weightKg: number;
  bodyFatPercentage: number;
}) {
  return prisma.progress.create({ data });
}

export async function findByUser(userId: string) {
  return prisma.progress.findMany({
    where: { userId },
    orderBy: { recordedAt: 'asc' },
  });
}

export async function findLatestByUser(userId: string) {
  return prisma.progress.findFirst({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
  });
}

export async function findByIdAndUser(id: string, userId: string) {
  return prisma.progress.findFirst({ where: { id, userId } });
}

export async function deleteById(id: string) {
  return prisma.progress.delete({ where: { id } });
}
