const axios = require('axios');
const https = require('https');
const logger = require('../../utils/logger');

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

exports.postNotifcations = async notification => {
  try {
    const endpoint = `${process.env.MS_NOTIFICATION_BASE_URL}/`;
    const data = {
      notification,
    };
    return axiosClient.post(endpoint, data).then(response => {
      if (response.status !== 200) {
        logger.info(response.status);
        logger.info(response.data);
        return null;
      }
      return response.data;
    });
  } catch (error) {
    logger.error(error);
    return null;
  }
};

exports.getNotifications = async data => {
  try {
    const endpoint = `${process.env.MS_NOTIFICATION_BASE_URL}/`;

    return axiosClient.get(endpoint, data).then(response => {
      if (response.status !== 200) {
        logger.info(response.status);
        logger.info(response.data);
        return null;
      }
      return response.data;
    });
  } catch (error) {
    logger.error(error);
    return null;
  }
};
