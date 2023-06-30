import { PrismaClient, User, Prisma } from '@prisma/client';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  getUserById = (id: string): Promise<User | null> => {
    return this.prisma.user.findUnique({ where: { id } });
  };

  createUser = (data: Prisma.UserCreateInput): Promise<User> => {
    return this.prisma.user.create({ data });
  };

  updateUser = (
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User | null> => {
    return this.prisma.user.update({ where: { id }, data });
  };

  deleteUser = (id: string): Promise<User | null> => {
    return this.prisma.user.delete({ where: { id } });
  };
}
