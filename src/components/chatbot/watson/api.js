const router = require('express').Router();
const dal = require('./dal');

router.post('/message', async (req, res) => dal.create.message('message', req, res));
router.post('/session', async (req, res) => dal.create.session('session', req, res));

module.exports = router;
