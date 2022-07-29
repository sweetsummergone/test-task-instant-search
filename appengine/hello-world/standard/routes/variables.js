const router = require('express').Router();

const { insertVariable, getVariables, deleteEntities, test } = require('../controllers/variables');

router.get('/all', getVariables);
router.get('/test', test)
router.post('/set', insertVariable);
router.get('/end', deleteEntities);

module.exports = router;