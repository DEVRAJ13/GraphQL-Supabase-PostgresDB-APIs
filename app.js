import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import { resolvers } from './src/resolvers/resolvers.js';
const typeDefs = readFileSync('./src/schema/schema.graphql', 'utf-8');

const server = new ApolloServer({
    typeDefs,
    resolvers
});

const { url } = await startStandaloneServer(server, {
    listen: {
        port: 4000
    }
});
console.log(`Server running on PORT:${url}`);