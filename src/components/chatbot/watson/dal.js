const axios = require('axios');
const jsonapi = require('../../../jsonapi');
const logger = require('../../../utils/logger');
const { throwCustomDomainError } = require('../../../utils/error');

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

/**
 * CREATE RESOURCE METHODS
 */

const postWatsonRequest = async (endpoint, req, res) => {
  try {
    const apiUrl = `${process.env.WATSONURL}/api/v1/${endpoint}`;
    const response = await tryAxiosRequest(() => axios.post(apiUrl, req.body));

    return res.json(response.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const create = {
  message: postWatsonRequest,
  session: postWatsonRequest,
};

module.exports = {
  create,
};
