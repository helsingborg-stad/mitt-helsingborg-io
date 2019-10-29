const router = require('express').Router();
const dal = require('./dal');
const authSchemas = require('./validationSchemas/index');

const schemaValidator = require('../middlewares/schemaValidator');

const validateRequest = schemaValidator(true, authSchemas);

router.post('/', validateRequest, async (req, res) => {
  try {
    const user_id = req.body.find(x => x.key === 'user_id').value;
    const service_id = req.body.find(x => x.key === 'service_id').value;
    const message = req.body.find(x => x.key === 'message').value;

    const notification = {
      user_id,
      service_id,
      message,
    };

    return res.json(await dal.postNotifcations(notification));
  } catch (err) {
    res.json(err);
  }
});

router.get('/', validateRequest, async (req, res) => {
  try {
    const limit = req.body.limit ? req.body.limit : 10;

    const data = {
      user_id,
      service_id,
      limit,
    };

    return res.json(await dal.getNotifcations(data));
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
