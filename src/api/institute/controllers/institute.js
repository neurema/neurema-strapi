'use strict';

/**
 * institute controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::institute.institute', ({ strapi }) => ({

  // Custom method to resolve tenant by subdomain
  async resolveTenant(ctx) {
    try {
      // 1. Get and normalize subdomain (force lowercase)
      const { subdomain } = ctx.params;
      
      if (!subdomain) {
        return ctx.badRequest('Subdomain is required');
      }

      const normalizedSubdomain = subdomain.toLowerCase();

      // --- DEBUG LOG START ---
      // This will show up in your terminal where Strapi is running
      console.log(`[ResolveTenant] Searching for subdomain: "${normalizedSubdomain}"`);
      // --- DEBUG LOG END ---

      // 2. Query the Database
      // Using strapi.db.query allows us to bypass some default API filters if needed
      const institute = await strapi.db.query('api::institute.institute').findOne({
        where: { 
          subdomain: normalizedSubdomain,
        },
        populate: ['logo'], // Grab the logo image details
        select: ['id', 'name', 'subdomain', 'themeColor', 'publishedAt'] // Grab essential fields
      });

      // --- DEBUG LOG START ---
      console.log(`[ResolveTenant] Database Result:`, institute ? `Found ID ${institute.id}` : 'Not Found (null)');
      // --- DEBUG LOG END ---

      // 3. Handle Not Found
      if (!institute) {
        return ctx.notFound('Institute not found. Please check the subdomain or ensure the entry is Published.');
      }

      // 4. Check if Published (Optional safeguard)
      // If you strictly want to block drafts, uncomment the lines below:
      /*
      if (!institute.publishedAt) {
         return ctx.notFound('Institute is currently in Draft mode.');
      }
      */

      // 5. Return formatted response
      return {
        exists: true,
        id: institute.id,
        name: institute.name,
        subdomain: institute.subdomain,
        themeColor: institute.themeColor || '#000000', // Default fallback color
        logoUrl: institute.logo ? institute.logo.url : null
      };

    } catch (error) {
      console.error('[ResolveTenant] Critical Error:', error);
      return ctx.internalServerError('Internal server error during tenant resolution');
    }
  },
}));

