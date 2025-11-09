import { GraphQLError } from "graphql";
import { createUserService, updateUserService, getUserByIdService } from "../services/services.js";

export const resolvers = {
    Query: {
        getUserById: async (_, { id }) => {
            return await getUserByIdService(id);
        },
    },
    Mutation: {
        createUser: async (_, { email, password }) => {
            try {
                return await createUserService(email, password);
            } catch (error) {
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
