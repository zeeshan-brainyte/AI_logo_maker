import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'AI Logo Maker API',
    description: 'API documentation for AI Logo Maker backend. LIVE URL: https://ailogomaker.orbitappspk.com/'
  },
//   host: 'localhost:8082',
  host: 'ailogomaker.orbitappspk.com',
  basePath: "/",
  schemes: ['https'],
  consumes: ['application/json'],
  produces: ['application/json'],
};

const outputFile = './swagger-output.json'; 
const routes = ['./index.js']; // Entry point that registers all routes

swaggerAutogen()(outputFile, routes, doc);