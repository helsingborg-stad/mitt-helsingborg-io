/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
require('dotenv').config();

const express = require('express');
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const jwt = require('express-jwt');
const cors = require('cors');
const pino = require('express-pino-logger');
const sslRedirect = require('heroku-ssl-redirect');
const swaggerDocument = require('../swagger/swagger.json');
const routes = require('./components/routes');
const logger = require('./utils/logger');
const { domainErrors, InternalError } = require('./utils/error');
const jsonapi = require('./jsonapi');

const app = express();

/**
 * Config
 */
const { PORT, JWT_AUTHSECRET } = process.env;

// enable ssl redirect in production enviroments
app.use(sslRedirect());

// Allow cors for dev-environment.
app.use(cors());
app.options('*', cors());

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
  next();
});

// Require authorization on all endpoints except those specified under unless.
// app.use(
//   jwt({ secret: JWT_AUTHSECRET }).unless({
//     path: ['/', '/api/v1', '/api/v1/', '/api/v1/auth/bankid', '/api/v1/auth/bankid/'],
//   })
// );

// If request is unauthorized, send back error information with 401 status.
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Your authorization token is missing or invalid.');
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Request logging
app.use(pino({ logger }));

// Add routes to the app.
app.get('/', (req, res) => res.send('Mitt Helsingborg touchpoint'));
app.use('/api/v1/', routes());

// Swagger for documenting the api, access through localhost:xxxx/api-docs.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const createErrorResponse = async (error, res) => {
  logger.info(error.status);
  logger.info(error.data);
  const serializedData = await jsonapi.serializer.serializeError(error);
  return res.status(error.status).json(serializedData);
};


// 404 - Unknown route
app.use((err, res) => {
  res.status(404);

  return createErrorResponse(err, res);
});

// Listen on port specfied in env-file.
const server = app.listen(PORT, () =>
  
  logger.info(`Mitt Helsingborg touchpoint listening on port ${PORT}!`)
);

module.exports = server;
