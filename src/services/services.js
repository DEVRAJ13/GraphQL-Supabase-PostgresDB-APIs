import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Utility: safely convert BigInt fields to string
const normalizeUser = (user) => ({
    ...user,
    id: user.id.toString(),
});

export const createUserService = async (email, password) => {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
        const err = new Error("EMAIL_ALREADY_EXISTS");
        err.code = "EMAIL_ALREADY_EXISTS";
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
        data: { email, password: hashedPassword },
    });

    return normalizeUser(user);
};

export const updateUserService = async (id, data) => {
    const existingUser = await prisma.users.findUnique({
        where: { id: BigInt(id) },
    });

    if (!existingUser) {
        const err = new Error("USER_NOT_FOUND");
        err.code = "USER_NOT_FOUND";
        throw err;
    }

    const updatedUser = await prisma.users.update({
        where: { id: BigInt(id) },
        data,
    });

    return normalizeUser(updatedUser);
};


export const getUserByIdService = async (id) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return normalizeUser(user);
  } catch (error) {
    console.error("getUserByIdService error:", error);
    throw new Error(error.message || "FAILED_TO_FETCH_USER");
  }
};
