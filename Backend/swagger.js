import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'AI Logo Maker API',
    description: 'API documentation for AI Logo Maker backend. Provides endpoints for presets and logo generation.'
  },
  host: 'localhost:8081',
  basePath: "/",
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
};

const outputFile = './swagger-output.json'; 
const routes = ['./index.js']; // Entry point that registers all routes

swaggerAutogen()(outputFile, routes, doc);