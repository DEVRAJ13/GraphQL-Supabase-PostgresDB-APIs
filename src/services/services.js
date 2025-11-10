import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
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
    data: {
      email,
      password: hashedPassword,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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


export const getAllUsersService = async ({
  page = 1,
  limit = 10,
  search = "",
  role,
  department,
  isActive,
  sortBy = "createdAt",
  sortOrder = "desc",
}) => {
  const skip = (page - 1) * limit;

  // Build dynamic filters
  const whereClause = {
    isDeleted: false,
    ...(role && { role }),
    ...(department && { department }),
    ...(typeof isActive === "boolean" && { isActive }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Fetch users + count in parallel
  const [users, totalUsers] = await Promise.all([
    prisma.users.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.users.count({ where: whereClause }),
  ]);

  // Convert numeric IDs to strings to satisfy GraphQL `ID` type
  const formattedUsers = users.map((user) => ({
    ...user,
    id: String(user.id),
  }));

  // Calculate pagination
  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users: formattedUsers,
    totalUsers,
    totalPages,
    currentPage: page,
  };
};
