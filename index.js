import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLScalarType } from "graphql";

const typeDefs = `
scalar DateTime

enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
}

type User {
    githubLogin: ID!
    name:String
    avatar:String
    postedPhotos:[Photo!]!
    inPhotos: [Photo!]!
}

type Photo {
    id:ID!
    url: String!
    name:String!
    description: String
    category: PhotoCategory!
    postedBy: User!
    taggedUsers:[User!]!
    created: DateTime!
}

type Query{
    totalPhotos: Int!
    allPhotos(after: DateTime): [Photo!]!
}

type Mutation {
    postPhoto(input: PostPhotoInput!):Photo!
}

input PostPhotoInput{
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
}
`;

let _id = 0;
let photos = [
  { id: "1", name: "Drop", created: "3-28-1977" },
  { id: "2", name: "Drop2", created: "1-2-1975" },
  { id: "2", name: "Drop3", created: "2018-04-15T19:09:57.308Z" },
];
let users = [];
let tags = [];
const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
  },

  Mutation: {
    postPhoto(parent, args) {
      let newPhoto = {
        id: _id++,
        ...args.input,
        created: new Date(),
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },

  Photo: {
    url: (parent) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin == parent.githubUser);
    },
    taggedUsers: (parent) =>
      tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((u) => u.githubLogin === userID)),
  },

  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) =>
      tags
        .filter((tag) => tag.userID === parent.id)
        .map((tag) => tag.photoID)
        .map((photoID) => photos.find((p) => p.id === photoID)),
  },
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `A valid date time value`,
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLit: (ast) => ast.value,
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
