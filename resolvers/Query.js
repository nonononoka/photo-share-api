export const Query = {
  totalPhotos: (_, __, { db }) =>
    db.collection("photos").estimatedDocumentCount(),

  allPhotos: (_, __, { db }) => db.collection("photos").find().toArray(),

  totalUsers: (_, __, { db }) =>
    db.collection("users").estimatedDocumentCount(),

  allUsers: (_, __, { db }) => db.collection("users").find().toArray(),

  me: (_, __, { currentUser }) => currentUser,
};
