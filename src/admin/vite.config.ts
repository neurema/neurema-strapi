import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  // Important: always return the modified config
  return mergeConfig(config, {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
    allowedHosts: ['neurema.com', 'www.neurema.com', 'admin.neurema.com', 'www.admin.neurema.com'],
    }
  });
};
