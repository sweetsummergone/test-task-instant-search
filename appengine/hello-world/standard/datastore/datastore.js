const { Datastore } = require('@google-cloud/datastore')

class DatastoreVariables extends Datastore {
  constructor() {
    super();
    this.callStack = new Map();
    this.undoStack = new Map();
  };

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
      const popAndPush = (operation) => {
        currentPushStack.push({ key: lastCommand.key, operation, data: lastCommand.data });
        stackToPush.set(jwt, currentPushStack);
        stackToPop.set(jwt, currentPopStack);
      }
      if (lastCommand.operation === 'set') {
        try {
          await this.delete(lastCommand.key);
          popAndPush("unset");
          return currentPopStack.length > 0 ? `${lastCommand.data.name} = ${currentPopStack[currentPopStack.length - 1].data.value}` : `${lastCommand.data.name} = None`
        }
        catch(err) {
          console.log(err);
        }
      } else {
        try {
          await this._insertVariable({ name: lastCommand.data.name, value: lastCommand.data.value }, jwt, lastCommand.data.updated);
          popAndPush("set");
          return `${lastCommand.data.name} = ${currentPushStack[currentPushStack.length - 1].data.value}`
        }
        catch(err) {
          console.log(err);
        }
      }
    } else {
      return 'NO COMMANDS';
    }
  }

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
        console.log(`Variable ${variableKey.id} created successfully.`);
      } else {
        await this.update(entity);
        console.log(`Variable ${variableKey.id} updated successfully.`);
      }
      return variableKey;
    } catch (err) {
      console.log(err);
    };
  }

  _unsetVariable = async (name, jwt) => {
    const query = this.createQuery('Variable')
      .filter('name', '=', name)
      .filter('jwt', '=', jwt);
    const result = await this.runQuery(query);
    try {
      await this.delete(result[0][0][this.KEY]);
      return result[0][0][this.KEY];
    }
    catch(err) {
      console.log(err);
    }
  }

  insertVatiable = async (variable, jwt, updated) => {
    const key = await this._insertVariable(variable, jwt, updated);
    const currentStack = !!this.callStack.get(jwt) ? this.callStack.get(jwt) : [];
    currentStack.push({ key, operation: "set", data: { name: variable.name, value: variable.value, updated } });
    this.callStack.set(jwt, currentStack);
  };

  unsetVariable = async (name, jwt) => {
    const key = await this._unsetVariable(name, jwt)
    const currentStack = !!this.undoStack.get(jwt) ? this.undoStack.get(jwt) : [];
    currentStack.push({ key, operation: "unset", data: { name: variable.name, value: variable.value, updated } });
    this.undoStack.set(jwt, currentStack);
  }

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
    const query = this.createQuery('Variable')
      .filter('jwt', '=', jwt);
    
    const result = await this.runQuery(query);
    // O(n). IDK how to improve it to O(1) without fetching all of keys
    this.delete(result[0].map(entity => entity[this.KEY]));
    this.callStack.clear();
    this.undoStack.clear();
    return 'CLEANED';
  }

  undo = async (jwt) => {
    return this._stackOperate(jwt, this.callStack, this.undoStack);
  }

  redo = async (jwt) => {
    return this._stackOperate(jwt, this.undoStack, this.callStack);
  }
}

const datastore = new DatastoreVariables({
  projectId: 'getting-hire',
})

module.exports = datastore
