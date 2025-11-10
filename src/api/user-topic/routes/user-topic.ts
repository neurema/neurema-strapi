/**
 * user-topic router
 */

import { factories } from '@strapi/strapi';

const coreRouter = factories.createCoreRouter('api::user-topic.user-topic');
const coreRoutes = typeof coreRouter.routes === 'function' ? coreRouter.routes() : coreRouter.routes;

export default {
	type: 'content-api',
	routes: [
		...coreRoutes,
		{
			method: 'POST',
			path: '/user-topics/bulk-sync',
			handler: 'user-topic.bulkSync',
			config: {
				policies: [],
				middlewares: [],
			},
		},
	],
};
