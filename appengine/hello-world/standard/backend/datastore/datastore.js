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
        try {
          await this.update({
            key: lastCommand.key,
            data: [
              {
                name: 'name',
                value: lastCommand.data.name,
              },
              {
                name: 'value',
                value: lastCommand.lastValue,
              },
              {
                name: 'updated',
                value: lastCommand.data.updated,
              },
              {
                name: 'jwt',
                value: jwt,
              },
            ],
          });
          push('unset');
          return `${lastCommand.data.name} = ${lastCommand.lastValue}`;
        } catch (err) {
          if (!!err.message) throw new ErrorHandler(502, err.message);
          throw new ErrorHandler(502, 'Something goes wrong. Try again.');
        }
      } else {
        try {
          await this._insertVariable(
            { name: lastCommand.data.name, value: lastCommand.data.value },
            jwt,
            lastCommand.data.updated
          );
          push('set');
          return `${lastCommand.data.name} = ${
            currentPushStack[currentPushStack.length - 1].data.value
          }`;
        } catch (err) {
          if (!!err.message) throw new ErrorHandler(502, err.message);
          throw new ErrorHandler(502, 'Something goes wrong. Try again.');
        }
      }
    } else {
      return 'NO COMMANDS';
    }
  };

  _insertVariable = async (variable, jwt, updated) => {
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
          value: updated,
        },
        {
          name: 'jwt',
          value: jwt,
        },
      ],
    };

    try {
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

  _unsetVariable = async (name, jwt) => {
    const query = this.createQuery('Variable')
      .filter('name', '=', name)
      .filter('jwt', '=', jwt);
    const result = await this.runQuery(query);
    try {
      await this.delete(result[0][0][this.KEY]);
      return result[0][0][this.KEY];
    } catch (err) {
      if (!!err.message) throw new ErrorHandler(502, err.message);
      throw new ErrorHandler(502, 'Something goes wrong. Try again.');
    }
  };

  insertVatiable = async (variable, jwt, updated) => {
    const lastValue = await this.getVariableValue(variable.name, jwt);
    const key = await this._insertVariable(variable, jwt, updated);
    const currentStack = !!this.callStack.get(jwt)
      ? this.callStack.get(jwt)
      : [];
    currentStack.push({
      key,
      operation: 'set',
      lastValue,
      data: { name: variable.name, value: variable.value, updated },
    });
    this.callStack.set(jwt, currentStack);
  };

  unsetVariable = async (name, jwt) => {
    const lastValue = await this.getVariableValue(name, jwt);
    const key = await this._unsetVariable(name, jwt);
    const currentStack = !!this.undoStack.get(jwt)
      ? this.undoStack.get(jwt)
      : [];
    currentStack.push({
      key,
      operation: 'unset',
      lastValue,
      data: { name, value: 'None', updated: (new Date()).toISOString() },
    });
    this.undoStack.set(jwt, currentStack);
  };

  getNumEqualTo = async (value, jwt) => {
    const query = this.createQuery('Variable')
      .filter('value', '=', value)
      .filter('jwt', '=', jwt);

    const result = await this.runQuery(query);
    return !!result[0][0] ? result[0].length : 0;
  };

  getVariableValue = async (name, jwt) => {
    const query = this.createQuery('Variable')
      .filter('name', '=', name)
      .filter('jwt', '=', jwt);

    const result = await this.runQuery(query);
    return !!result[0][0] ? result[0][0].value : 'None';
  };

  clear = async (jwt) => {
    const query = this.createQuery('Variable').filter('jwt', '=', jwt);

    const result = await this.runQuery(query);
    // O(n). IDK how to improve it to O(1) without fetching all of keys
    this.delete(result[0].map((entity) => entity[this.KEY]));
    this.callStack.clear();
    this.undoStack.clear();
    return 'CLEANED';
  };

  undo = async (jwt) => {
    return this._stackOperate(jwt, this.callStack, this.undoStack);
  };

  redo = async (jwt) => {
    return this._stackOperate(jwt, this.undoStack, this.callStack);
  };
}

const datastore = new DatastoreVariables({
  projectId: 'getting-hire',
});

module.exports = datastore;
