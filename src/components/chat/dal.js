const axios = require('axios');
const jsonapi = require('../../jsonapi');
const logger = require('../../utils/logger');
const { throwCustomDomainError } = require('../../utils/error');

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

const postWatsonMsg = async (req, res) => {
  try {
    const endpoint = `${process.env.MS_WATSON_BASE_URL}/api/v1/message`;
    const response = await tryAxiosRequest(() => axios.post(endpoint, req.body));

    return res.json(response.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const create = {
  message: postWatsonMsg,
};

/**
 * READ RESOURCE METHODS
 */

const getWatsonWorkspace = async (req, res) => {
  try {
    const endpoint = `${process.env.MS_WATSON_BASE_URL}/api/v1/workspaces`;
    const response = await tryAxiosRequest(() => axios.get(endpoint));

    return res.json(response.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const read = {
  workspaces: getWatsonWorkspace,
};

module.exports = {
  create,
  read,
};
