import { Query } from "./Query.js";
import { Mutation } from "./Mutation.js";
import { Type } from "./Type.js";
import { Subscription } from "./Subscription.js";

export const resolvers = {
  Query,
  Mutation,
  Subscription,
  ...Type,
};
