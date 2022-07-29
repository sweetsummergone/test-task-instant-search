const router = require('express').Router();

const { insertVariable, getVariables } = require('../controllers/variables');

router.get('/all', getVariables)
router.post('/set', insertVariable);

module.exports = router;