const router = require('express').Router();

const { insertVariable, getVariables, deleteEntities } = require('../controllers/variables');

router.get('/all', getVariables)
router.post('/set', insertVariable);
router.get('/end', deleteEntities);

module.exports = router;