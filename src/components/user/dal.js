const axios = require('axios');
const https = require('https');
const logger = require('../../utils/logger');
const { throwCustomDomainError } = require('../../utils/error');
const jsonapi = require('../../jsonapi');

const createErrorResponse = async (error, res) => {
  logger.info(error.status);
  logger.info(error.data);
  const serializedData = await jsonapi.serializer.serializeError(error);
  return res.status(error.status).json(serializedData);
};

const tryAxiosRequest = async callback => {
  try {
    const response = await callback();
    return response;
  } catch (error) {
    logger.info(error);
    throwCustomDomainError(error.response.status);
    return undefined;
  }
};

const axiosClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * READ RESOURCE METHODS
 */

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const endpoint = `${process.env.USERURL}/users/${id}`;
    const response = await tryAxiosRequest(() => axiosClient.get(endpoint));

    if (Object.entries(response.data.data.attributes).length === 0) {
      throwCustomDomainError(400);
    }

    return res.json(response.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const read = {
  user: getUser,
};

module.exports = {
  read,
};
