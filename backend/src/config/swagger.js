const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Matching API',
      version: '1.0.0',
      description: 'API documentation for the Real Estate Matching System (Offers, Requests, Matches, Users)',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'BROKER'] },
          },
        },
        Offer: {
          type: 'object',
          required: ['type', 'usage', 'landStatus', 'city', 'district', 'areaFrom', 'areaTo', 'priceFrom', 'priceTo'],
          properties: {
            type: { type: 'string', enum: ['LAND', 'PROJECT', 'PLAN'] },
            usage: { type: 'string' },
            landStatus: { type: 'string' },
            city: { type: 'string' },
            district: { type: 'string' },
            areaFrom: { type: 'number' },
            areaTo: { type: 'number' },
            priceFrom: { type: 'number' },
            priceTo: { type: 'number' },
            description: { type: 'string' },
          },
        },
        Request: {
          type: 'object',
          required: ['type', 'usage', 'landStatus', 'city', 'district', 'areaFrom', 'areaTo', 'budgetFrom', 'budgetTo'],
          properties: {
            type: { type: 'string' },
            usage: { type: 'string' },
            budgetFrom: { type: 'number' },
            budgetTo: { type: 'number' },
          },
        }
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Files containing annotations
};

const specs = swaggerJsdoc(options);
module.exports = specs;
