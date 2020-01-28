const axios = require('axios');
const https = require('https');
const logger = require('../../utils/logger');
const jsonapi = require('../../jsonapi');
const { throwCustomDomainError } = require('../../utils/error');

const axiosClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    cert: process.env.CERT,
    key: process.env.KEY,
  }),
  headers: {
    'Content-Type': 'application/json',
  },
});

const createErrorResponse = async (error, res) => {
  logger.info(error.status);
  logger.info(error.data);
  const serializedData = await jsonapi.serializer.serializeError(error);
  return res.status(error.status).json(serializedData);
};

const tryAxiosRequest = async (callback) => {
  try {
    const response = await callback();
    return response;
  } catch (error) {
    let statusCode;

    if (!error.response) {
      statusCode = 502 // Triggers if axios gets an connection error from a service.
    } else {
      statusCode = error.response.status
    }

    throwCustomDomainError(statusCode);
    return undefined;
  }
};

const readForms = async (req, res) => {
  try {
    const endpoint = `${process.env.FORMSERVICEURL}/api/v1/forms/`;
    const axiosResponse = await tryAxiosRequest(() => axiosClient.get(endpoint));

    return res.json(axiosResponse.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const readForm = async (req, res) => {
  try {
    const { formId } = req.params;
    const endpoint = `${process.env.FORMSERVICEURL}/api/v1/forms/${formId}`;
    const axiosResponse = await tryAxiosRequest(() => axiosClient.get(endpoint));

    return res.json(axiosResponse.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const readFormQuestions = async (req, res) => {
  try {
    const { formId } = req.params;
    const endpoint = `${process.env.FORMSERVICEURL}/api/v1/forms/${formId}/questions`;
    const axiosResponse = await tryAxiosRequest(() => axiosClient.get(endpoint));

    return res.json(axiosResponse.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const read = {
  forms: readForms,
  form: readForm,
  questions: readFormQuestions,
};

module.exports = {
  read,
};
