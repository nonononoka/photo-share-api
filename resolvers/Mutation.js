import { authorizeWithGithub } from "../github.js";
import * as dotenv from "dotenv";

dotenv.config();

export const Mutation = {
  addFakeUsers: async (root, { count }, { db }) => {
    const randomUserApi = `https://randomuser.me/api/?results=${count}`;
    const { results } = await fetch(randomUserApi).then((res) => res.json());
    const users = results.map((r) => ({
      githubLogin: r.login.username,
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubToken: r.login.sha1,
    }));
    await db.collection("users").insertMany(users);
    return users;
  },
  postPhoto: async (_, args, { db, currentUser }) => {
    console.log(args);
    if (!currentUser) {
      throw new Error("only an authorized user can post a photo");
    }
    const newPhoto = {
      githubUser: currentUser.githubLogin,
      created: new Date(),
      ...args.input,
    };
    const { insertedId } = await db.collection("photos").insertOne(newPhoto);
    newPhoto.id = insertedId;
    return newPhoto;
  },

  githubAuth: async (_, { code }, { db }) => {
    const { message, access_token, avatar_url, login, name } =
      await authorizeWithGithub({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      });

    if (message) {
      throw new Error(message);
    }

    const latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url,
    };

    // update record based on new information.

    //upsert:Optional. When true,
    // replaceOne()
    // either:

    // Inserts the document from the replacement parameter if no document matches the filter.

    // Replaces the document that matches the filter with the replacement document.
    const ops = await db
      .collection("users")
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });
    return { user: latestUserInfo, token: access_token };
  },

  fakeUserAuth: async (_, { githubLogin }, { db }) => {
    const user = await db.collection("users").findOne({ githubLogin });
    if (!user) {
      throw new Error(`Cannot find user with githubLogin "${githubLogin}"`);
    }
    return {
      token: user.githubToken,
      user,
    };
  },
};
