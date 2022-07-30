const router = require('express').Router();
const auth = require('../middlewares/auth');
const { createToken } = require('../utils/auth');

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

module.exports = (app) => {
  app.get('/', (req, res) => {
    const token = createToken(req.ip);
    res.send({ token });
  });
  app.get('/all', getVariables);
  app.get('/get', getVariableValue);
  app.get('/numequalto', getNumEqualTo);
  app.get('/end', deleteEntities);
  app.get('/set', insertVariable);
  app.get('/unset', unsetVariable);
  app.get('/undo', undo);
  app.get('/redo', redo);
  app.get('*', () => {
    throw new ErrorHandler(404, 'Requested resource not found');
  });
}

