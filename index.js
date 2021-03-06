import express from "express";
import { graphqlExpress, graphiqlExpress } from "apollo-server-express";
import { Engine } from "apollo-engine";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import schema from "./schema";
import { checkToken } from "./utils/token";
import { formatError, createError } from "apollo-errors";
import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe, GraphQLError } from "graphql";

require("dotenv").config();

const PORT = process.env.PORT || 8080;

let engine;

export function startApolloEngine() {
  // Initialize Apollo Engine

  engine = new Engine({
    graphqlPort: PORT,
    engineConfig: {
      apiKey: process.env.APOLLO_ENGINE
    }
  });

  engine.start();
}

export function startExpressApp() {
  // Initialize Express Server
  const app = express();

  // Middleware for Apollo Engine tracing has to be first
  app.use(engine.expressMiddleware());
  // Use GZIP on requests
  app.use(compression());
  app.use(cors({ origin: "*" }));
  // Enable user context-

  app.use(function(req, res, next) {
    const token = req.get("authorization");

    if (token == "null" || !token) return next();

    try {
      const payload = checkToken(token);

      req.user = {
        id: payload.userId,
        exp: payload.exp,
        iat: payload.iat
      };
    } catch (err) {
      console.error(err);
      console.log("CANT GET USER");
    }

    next();
  });

  // Start graphql

  app.use(
    "/graphql",
    bodyParser.json(),
    graphqlExpress(request => ({
      schema,
      debug: true,
      tracing: true,
      cacheControl: true,
      context: { user: request.user },
      formatError
    }))
  );

  app.get("/graphiql", graphiqlExpress({ endpointURL: "/graphql" }));

  // app.listen(PORT);

  const ws = createServer(app);

  ws.listen(PORT, () => {
    console.log(`GraphQL Server is now running on http://localhost:${PORT}`);
    // Set up the WebSocket for handling GraphQL subscriptions
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        onConnect: (connectionParams, webSocket) => {
          let req = {};

          console.log(webSocket);

          console.log("ON CONNECT");
          console.log(connectionParams);

          return checkToken(connectionParams.token, function(payload) {
            return {
              user: {
                id: payload.userId,
                exp: payload.exp,
                iat: payload.iat
              }
            };
          });
        }
      },
      {
        server: ws,
        path: "/subscriptions"
      }
    );
  });
}
