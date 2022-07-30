const router = require('express').Router();

const {
  insertVariable,
  getVariables,
  deleteEntities,
  getVariableValue,
  unsetVariable,
  getNumEqualTo,
  undo,
  redo,
} = require('../controllers/variables');

router.get('/all', getVariables);
router.get('/get', getVariableValue);
router.get('/numequalto', getNumEqualTo);
router.get('/end', deleteEntities);
router.get('/set', insertVariable);
router.get('/unset', unsetVariable);
router.get('/undo', undo);
router.get('/redo', redo);

module.exports = router;
