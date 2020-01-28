const router = require('express').Router();
const dal = require('./dal');

router.post('/message', async (req, res) => dal.create.message(req, res));

module.exports = router;
