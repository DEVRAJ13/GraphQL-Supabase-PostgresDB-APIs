import { GraphQLError } from "graphql";
import { createUserService, updateUserService, getUserByIdService, getAllUsersService } from "../services/services.js";

export const resolvers = {
    Query: {
        getUserById: async (_, { id }) => {
            return await getUserByIdService(id);
        },
        getAllUsers: async (_, args) => {
            try {
                return await getAllUsersService(args);
            } catch (error) {
                console.error("Error in getAllUsers resolver:", error);
                throw new Error(error.message || "INTERNAL_SERVER_ERROR");
            }
        },
    },
    Mutation: {
        createUser: async (_, { email, password }) => {
            try {
                return await createUserService(email, password);
            } catch (error) {
                console.error("Error in createUser resolver:", error);
                if (error.code === "EMAIL_ALREADY_EXISTS") {
                    throw new GraphQLError("Email already registered.", {
                        extensions: { code: "EMAIL_ALREADY_EXISTS" },
                    });
                }
                throw new GraphQLError("Internal Server Error");
            }
        },
        updateUser: async (_, { id, ...data }) => {
            try {
                return await updateUserService(id, data);
            } catch (error) {
                if (error.code === "USER_NOT_FOUND") {
                    throw new GraphQLError("User not found.", {
                        extensions: { code: "USER_NOT_FOUND" },
                    });
                }
                throw new GraphQLError("Internal Server Error");
            }
        },
    },
};
