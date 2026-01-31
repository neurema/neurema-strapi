'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::institute.institute', ({ strapi }) => ({
  
  // 1. The custom method must be INSIDE this arrow function
  async resolveTenant(ctx) {
    console.log("DEBUG: resolveTenant was hit!"); // Check your terminal for this
    
    const { subdomain } = ctx.params;
    
    // Simple test to ensure logic works
    const institute = await strapi.db.query('api::institute.institute').findOne({
      where: { subdomain: subdomain },
      select: ['name', 'id']
    });

    if (!institute) return ctx.notFound('Subdomain not found in DB');
    
    return institute;
  }

}));
