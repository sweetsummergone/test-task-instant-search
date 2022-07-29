const {Datastore} = require('@google-cloud/datastore');

class DatastoreVariables extends Datastore {
    getVariable = async (name, hash) => {
        const query = this
          .createQuery('variable')
          .filter('name', '=', name);
      
        return this.runQuery(query);
    }

    insertVatiable = async (variable, jwt) => {
        const variableKey = this.key('Variable');
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
              name: 'jwt',
              value: jwt,
            }
          ]
        }
        try {
          await this.save(entity);
          console.log(`Variable ${variableKey.id} created successfully.`);
        } catch (err) {
          console.error('ERROR:', err);
        }
    }
}

const datastore = new DatastoreVariables({
    projectId: 'getting-hire',
});

module.exports = datastore;