const datastore = require('../datastore/datastore');

const sendSuccessResponse = (res, obj) => {
  res.json(obj);
};

module.exports.insertVariable = async (req, res, next) => {
  const name = req.query.name;
  const value = req.query.value;
  const jwt = req.headers.authorization.replace('Bearer ', '');

  try {
    await datastore.insertVariable(
      { name, value, updated: (new Date()).toISOString() },
      jwt,
    );
    sendSuccessResponse(res, {[name] : value});
  } catch (error) {
    next(error);
  }
};

module.exports.unsetVariable = async (req, res, next) => {
  const name = req.query.name;
  const jwt = req.headers.authorization.replace('Bearer ', '');
  
  try {
    await datastore.unsetVariable({ name, value: 'None' }, jwt);
    sendSuccessResponse(res, {[name] : 'None'});
  } catch (error) {
    next(error);
  }
};

module.exports.getNumEqualTo = async (req, res, next) => {
  const value = req.query.value;
  const jwt = req.headers.authorization.replace('Bearer ', '');

  try {
    const count = await datastore.getNumEqualTo(value, jwt);
    sendSuccessResponse(res, count);
  } catch (error) {
    next(error);
  }
};

// Temponary function for debug
module.exports.getVariables = async (req, res, next) => {
  const jwt = req.headers.authorization.replace('Bearer ', '');
  const query = datastore.createQuery('Variable').filter('jwt', '=', jwt);

  try {
    datastore.runQuery(query).then((results) => {
      const variables = {}
      results[0].forEach((variable) => {
        variables[variable.name] = variable.value}
      );
      sendSuccessResponse(res, variables);
    });
  } catch (error) {
    next(error);
  }
};
//

module.exports.deleteEntities = async (req, res, next) => {
  const jwt = req.headers.authorization.replace('Bearer ', '');

  try {
    const result = await datastore.clear(jwt);
    sendSuccessResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports.getVariableValue = async (req, res, next) => {
  const name = req.query.name;
  const jwt = req.headers.authorization.replace('Bearer ', '');

  try {
    const result = await datastore.getVariableValue(name, jwt);
    sendSuccessResponse(res, {[name]: result});
  } catch (error) {
    next(error);
  }
};

module.exports.undo = async (req, res, next) => {
  const jwt = req.headers.authorization.replace('Bearer ', '');
  try {
    const result = await datastore.undo(jwt);
    sendSuccessResponse(res, result);
  } catch (error) {
    next(error);
  }
};

module.exports.redo = async (req, res, next) => {
  const jwt = req.headers.authorization.replace('Bearer ', '');
  try {
    const result = await datastore.redo(jwt);
    sendSuccessResponse(res, result);
  } catch (error) {
    next(error);
  }
};
