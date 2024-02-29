import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const Subscription = {
  newPhoto: {
    subscribe: () => {
      return pubsub.asyncIterator("photo-added");
    },
  },
};
