import { Query } from "./Query.js";
import { Mutation } from "./Mutation.js";
import { Type } from "./Type.js";
export const resolvers = {
  Query,
  Mutation,
  ...Type,
};
