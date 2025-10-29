export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('URL', 'https://neurema.com/strapi'),
  app: {
    keys: env.array('APP_KEYS'),
  },
settings: {
    // ✅ this controls which hosts Strapi accepts requests from
    allowedHosts: ['neurema.com', 'www.neurema.com', 'localhost'],
  },
});
