const { Datastore } = require('@google-cloud/datastore');
const { ErrorHandler } = require('../utils/error');

class DatastoreVariables extends Datastore {
  constructor() {
    super();
    this.callStack = new Map();
    this.undoStack = new Map();
  }

  _validateUnique = async (name, jwt) => {
    const query = this.createQuery('Variable')
      .filter('name', '=', name)
      .filter('jwt', '=', jwt);
    const result = await this.runQuery(query);
    return result[0];
  };

  _stackOperate = async (jwt, stackToPop, stackToPush) => {
    const currentPopStack = !!stackToPop.get(jwt) ? stackToPop.get(jwt) : [];
    const currentPushStack = !!stackToPush.get(jwt) ? stackToPush.get(jwt) : [];
    if (!!currentPopStack[0]) {
      const lastCommand = currentPopStack.pop();
      const push = (operation) => {
        this._insertVariable(
          { name: lastCommand.data.name, value: operation === 'unset' ? lastCommand.lastValue : lastCommand.data.value, updated: lastCommand.data.updated },
          jwt,
        );
        currentPushStack.push({
          key: lastCommand.key,
          lastValue: lastCommand.lastValue,
          operation,
          data: lastCommand.data,
        });
        stackToPush.set(jwt, currentPushStack);
        stackToPop.set(jwt, currentPopStack);
      };
      if (lastCommand.operation === 'set') {
        push('unset');
        return { [lastCommand.data.name]: lastCommand.lastValue };
      } else {
        push('set');
        return { [lastCommand.data.name]: currentPushStack[currentPushStack.length - 1].data.value };
      }
    } else {
      return 'NO COMMANDS';
    }
  };

  _insertVariable = async (variable, jwt) => {
    try {
      const unique = await this._validateUnique(variable.name, jwt);
      const isUnique = !!!unique[0];
      const variableKey = isUnique ? this.key('Variable') : unique[0][this.KEY];

      const entity = {
        key: variableKey,
        data: [
          {
            name: 'name',
            value: variable.name,
          },
          {
            name: 'value',
            value: variable.value,
          },
          {
            name: 'updated',
            value: variable.updated,
          },
          {
            name: 'jwt',
            value: jwt,
          },
        ],
      };
      if (isUnique) {
        await this.save(entity);
      } else {
        await this.update(entity);
      }
      return variableKey;
    } catch (err) {
      if (!!err.message) throw new ErrorHandler(502, err.message);
      throw new ErrorHandler(502, 'Something goes wrong. Try again.');
    }
  };

  _unsetVariable = async (variable, jwt) => {
    try {
      const query = this.createQuery('Variable')
        .filter('name', '=', variable.name)
        .filter('jwt', '=', jwt);
      const result = await this.runQuery(query);
      this.delete(result[0][0][this.KEY]);
      return result[0][0][this.KEY];
    } catch (err) {
      if (!!err.message) throw new ErrorHandler(502, err.message);
      throw new ErrorHandler(502, 'Something goes wrong. Try again.');
    }
  };

  _operateVariable = async (variable, jwt, func, type) => {
    try {
      const lastValue = await this.getVariableValue(variable.name, jwt);
      const key = await func(variable, jwt);
      const currentStack = !!this.callStack.get(jwt)
        ? this.callStack.get(jwt)
        : [];
      currentStack.push({
        key,
        operation: type,
        lastValue,
        data: {
          name: variable.name,
          value: variable.value,
          updated: new Date().toISOString(),
        },
      });
      this.callStack.set(jwt, currentStack);
      this.undoStack.clear();
    } catch (err) {
      if (!!err.message) throw new ErrorHandler(502, err.message);
      throw new ErrorHandler(502, 'Something goes wrong. Try again.');
    }
  };

  insertVariable = async (variable, jwt) => {
    this._operateVariable(variable, jwt, this._insertVariable, 'set');
  };

  unsetVariable = async (variable, jwt) => {
    this._operateVariable(variable, jwt, this._unsetVariable, 'set');
  };

  getNumEqualTo = async (value, jwt) => {
    try {
      const query = this.createQuery('Variable')
        .filter('value', '=', value)
        .filter('jwt', '=', jwt);

      const result = await this.runQuery(query);
      return !!result[0][0] ? result[0].length : 0;
    } catch (err) {
      if (!!err.message) throw new ErrorHandler(502, err.message);
      throw new ErrorHandler(502, 'Something goes wrong. Try again.');
    }
  };

  getVariableValue = async (name, jwt) => {
    try {
      const query = this.createQuery('Variable')
        .filter('name', '=', name)
        .filter('jwt', '=', jwt);

      const result = await this.runQuery(query);
      return !!result[0][0] ? result[0][0].value : 'None';
    } catch (err) {
      if (!!err.message) throw new ErrorHandler(502, err.message);
      throw new ErrorHandler(502, 'Something goes wrong. Try again.');
    }
  };

  clear = async (jwt) => {
    const query = this.createQuery('Variable').filter('jwt', '=', jwt);

    const result = await this.runQuery(query);
    this.delete(result[0].map((entity) => entity[this.KEY]));
    this.callStack.clear();
    this.undoStack.clear();
    return 'CLEANED';
  };

  undo = async (jwt) => {
    const result = await this._stackOperate(
      jwt,
      this.callStack,
      this.undoStack
    );
    return result;
  };

  redo = async (jwt) => {
    const result = await this._stackOperate(
      jwt,
      this.undoStack,
      this.callStack
    );
    return result;
  };
}

const datastore = new DatastoreVariables({
  projectId: 'getting-hire',
});

module.exports = datastore;
