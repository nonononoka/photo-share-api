import { GraphQLScalarType } from "graphql";

export const Type = {
  Photo: {
    id: (parent) => parent.id || parent._id,
    url: (parent) => {
      return `http://yoursite.com/img/${parent.id}.jpg`;
    },
    postedBy: async (parent, _, context) => {
      return await context.db
        .collection("users")
        .findOne({ githubLogin: parent.githubUser });
    },
    taggedUsers: async (parent, _, { db }) => {
      const tags = await db
        .collection("tags")
        .find({ photoID: parent.id })
        .toArray();
      const userIds = tags.map((t) => t.userID);
      return db
        .collection("users")
        .find({ githubLogin: { $in: userIds } })
        .toArray();
    },
  },

  User: {
    postedPhotos: (parent, _, { db }) => {
      return db
        .collection("photos")
        .find({ githubUser: parent.githubLogin })
        .toArray();
    },
    inPhotos: async (parent, _, { db }) => {
      const photos = await db
        .collection("tags")
        .find({ userID: parent.githubLogin })
        .toArray();
      const photoIds = photos.map((p) => p.photoID);
      return db
        .collection("photos")
        .find({ id: { $in: photoIds } })
        .toArray();
    },
  },

  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A valid date time value`,
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLit: (ast) => ast.value,
  }),
};
