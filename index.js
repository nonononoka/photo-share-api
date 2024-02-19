import { ApolloServer } from "apollo-server-express";
import express from "express";
import expressPlayground from "graphql-playground-middleware-express";
import { connectMongoDb } from "./mongodb.js";
import { readFileSync } from "fs";
import { resolvers } from "./resolvers/index.js";
const typeDefs = readFileSync(`./typeDefs.graphql`, `UTF-8`);

async function start() {
  // setup mongodb
  const db = await connectMongoDb();
  const context = { db };

  // setup express server
  const app = express();
  app.get("/", (req, res) => res.send("Welcome to the PhotoShare API"));
  app.get("/playground", expressPlayground.default({ endpoint: "/graphql" }));
  app.listen({ port: 4000 }, () => {
    console.log(
      `GraphQL Service running at http://localhost:4000${server.graphqlPath}`
    );
  });

  // set up graphql server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
  });
  await server.start();
  server.applyMiddleware({ app });
}

start();
