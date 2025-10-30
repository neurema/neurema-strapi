module.exports = {
  graphql: {
    enabled: true,
    config: {
      // Optional: enable GraphQL Playground (built-in GraphiQL interface)
      playgroundAlways: true,

      // Optional: adjust default endpoint or depth
      defaultLimit: 25,
      maxLimit: 100,
      apolloServer: {
        introspection: true,
      },
    },
  },
};
