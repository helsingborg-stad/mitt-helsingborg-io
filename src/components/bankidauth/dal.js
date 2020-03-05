const axios = require('axios');
const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const { throwCustomDomainError } = require('../../utils/error');
const jsonapi = require('../../jsonapi');

const axiosClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
    cert: fs.readFileSync(path.resolve(__dirname, '../../../assets/certificates/server.crt')),
    key: fs.readFileSync(path.resolve(__dirname, '../../../assets/certificates/server.key')),
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

const createSuccessResponse = async (data, res, jsonapiType, converter = undefined) => {
  let dataToSerialize = data;
  if (converter) {
    dataToSerialize = await jsonapi.convert[converter](dataToSerialize);
  }

  const serializedData = await jsonapi.serializer.serialize(jsonapiType, dataToSerialize);
  return res.json(serializedData);
};

const tryAxiosRequest = async callback => {
  try {
    const response = await callback();
    return response;
  } catch (error) {
    let statusCode;

    if (!error.response) {
      statusCode = 502; // Triggers if axios gets an connection error from a service.
    } else {
      statusCode = error.response.status;
    }

    throwCustomDomainError(statusCode);
    return undefined;
  }
};

const auth = async (req, res) => {
  try {
    const { personalNumber, endUserIp } = req.body;
    const endpoint = `${process.env.BANKIDURL}/auth`;
    const token = jwt.sign({ pno: personalNumber }, `${process.env.BANKIDURL}/auth`, {
      expiresIn: '24h',
    });
    console.log(process.env.CERT);
    const data = {
      personalNumber,
      endUserIp,
      userVisibleData: 'Helsingborg stad',
    };

    const jsonapiResponse = await tryAxiosRequest(() => axiosClient.post(endpoint, data));

    const deserializedJsonapiResponse = jsonapi.serializer.deserialize(
      'bankidauth',
      jsonapiResponse.data
    );

    deserializedJsonapiResponse.token = token;

    return await createSuccessResponse(deserializedJsonapiResponse, res, 'bankidauth');
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const collect = async (req, res) => {
  try {
    const { orderRef } = req.body;
    const endpoint = `${process.env.BANKIDURL}/collect`;

    const data = {
      orderRef,
    };

    const response = await tryAxiosRequest(() => axiosClient.post(endpoint, data));

    return res.json(response.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const cancel = async (req, res) => {
  try {
    const { orderRef } = req.body;
    const endpoint = `${process.env.BANKIDURL}/cancel`;

    const data = {
      orderRef,
    };

    const response = await tryAxiosRequest(() => axiosClient.post(endpoint, { data }));

    return res.json(response.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const sign = async (req, res) => {
  try {
    const { personalNumber, endUserIp, userVisibleData } = req.body;
    const endpoint = `${process.env.BANKIDURL}/sign`;
    const data = {
      personalNumber,
      endUserIp,
      userVisibleData,
    };
    const response = await tryAxiosRequest(() => axiosClient.post(endpoint, data));

    return res.json(response.data);
  } catch (error) {
    return createErrorResponse(error, res);
  }
};

const bankid = {
  auth,
  sign,
  cancel,
  collect,
};

module.exports = {
  bankid,
};
