const router = require('express').Router();

const { insertVariable, getVariables, deleteEntities, test, getVariable, getVariableValue, unsetVariable, getNumEqualTo } = require('../controllers/variables');

router.get('/all', getVariables);
router.get('/get', getVariableValue);
router.get('/numequalto', getNumEqualTo);
router.get('/end', deleteEntities);
router.get('/set', insertVariable);
router.get('/unset', unsetVariable);

module.exports = router;