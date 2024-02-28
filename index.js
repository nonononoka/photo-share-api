import { ApolloServer } from "apollo-server-express";
import express from "express";
import expressPlayground from "graphql-playground-middleware-express";
import { connectMongoDb } from "./mongodb.js";
import { readFileSync } from "fs";
import { resolvers } from "./resolvers/index.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { createServer } from "http";
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginDrainHttpServer } from "apollo-server-core";

const typeDefs = readFileSync(`./typeDefs.graphql`, `UTF-8`).toString();

async function start() {
  // setup mongodb
  const db = await connectMongoDb();
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // setup express server
  const app = express();
  app.get("/", (req, res) => res.send("Welcome to the PhotoShare API"));
  // app.get("/playground", expressPlayground.default({ endpoint: "/graphql" }));
  // app.listen({ port: 4000 }, () => {
  //   console.log(
  //     `GraphQL Service running at http://localhost:4000${server.graphqlPath}`
  //   );
  // });
  const httpServer = createServer(app);

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  // Save the returned server's info so we can shutdown this server later
  const serverCleanup = useServer({ schema }, wsServer);

  // set up graphql server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers["authorization"];
      if (githubToken) {
        const currentUser = await db
          .collection("users")
          .findOne({ githubToken });
        return { db, currentUser };
      } else {
        return { db, currentUser: null };
      }
    },
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  // Now that our HTTP server is fully set up, we can listen to it.
  httpServer.listen(PORT, () => {
    console.log(
      `Server is now running on http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

start();
