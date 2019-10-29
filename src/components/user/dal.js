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
    cert: process.env.AXIOS_CERT,
    key: process.env.AXIOS_KEY,
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

    const endpoint = `${process.env.MS_USERDATA_BASE_URL}/user/${id}`;
    const response = await tryAxiosRequest(() => axiosClient.get(endpoint));

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
