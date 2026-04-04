import prisma from '../config/prisma';

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  fullName: string;
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
    },
  });
}
