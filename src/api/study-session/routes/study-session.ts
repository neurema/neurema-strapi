/**
 * study-session router
 */

import { factories } from '@strapi/strapi';

const coreRouter = factories.createCoreRouter('api::study-session.study-session');
const coreRoutes = typeof coreRouter.routes === 'function' ? coreRouter.routes() : coreRouter.routes;

export default {
	type: 'content-api',
	routes: [
		...coreRoutes,
		{
			method: 'POST',
			path: '/study-sessions/bulk-sync',
			handler: 'study-session.bulkSync',
			config: {
				policies: [],
				middlewares: [],
			},
		},
	],
};
