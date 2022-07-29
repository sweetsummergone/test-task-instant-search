const { Datastore } = require('@google-cloud/datastore')

class DatastoreVariables extends Datastore {
  _validateUnique = async (name, jwt) => {
    const query = this.createQuery('Variable')
      .filter('name', '=', name)
      .filter('jwt', '=', jwt);
    const result = await this.runQuery(query)
    return result[0]
  }

  insertVatiable = async (variable, jwt, updated) => {
    const unique = await this._validateUnique(variable.name, jwt)
    const isUnique = !!!unique[0]
    const variableKey = isUnique ? this.key('Variable') : unique[0][this.KEY]
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
    }
    try {
      if (isUnique) {
        await this.save(entity)
        console.log(`Variable ${variableKey.id} created successfully.`)
      } else {
        await this.update(entity)
        console.log(`Variable ${variableKey.id} updated successfully.`)
      }
    } catch (err) {
      console.log(err)
    }
  }

  unsetVariable = async (name, jwt) => {
    const query = this.createQuery('Variable')
      .filter('name', '=', name)
      .filter('jwt', '=', jwt);
    const result = await this.runQuery(query);
    try {
      await this.delete(result[0][0][this.KEY]);
    }
    catch(err) {
      console.log(err);
    }
  }

  getVariableValue = async (name, jwt) => {
    const query = this.createQuery('Variable')
      .filter('name', '=', name)
      .filter('jwt', '=', jwt);

    const result = await this.runQuery(query);
    return !!result[0][0] ? result[0][0].value : 'None';
  }
}

const datastore = new DatastoreVariables({
  projectId: 'getting-hire',
})

module.exports = datastore
