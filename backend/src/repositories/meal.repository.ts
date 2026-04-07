import prisma from '../config/prisma';

export async function create(data: {
  userId: string;
  mealName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  return prisma.meal.create({ data });
}

export async function findByUserAndDateRange(userId: string, from: Date, to: Date) {
  return prisma.meal.findMany({
    where: {
      userId,
      loggedAt: { gte: from, lt: to },
    },
    orderBy: { loggedAt: 'asc' },
  });
}

export async function findByIdAndUser(id: string, userId: string) {
  return prisma.meal.findFirst({ where: { id, userId } });
}

export async function deleteById(id: string) {
  return prisma.meal.delete({ where: { id } });
}
