const datastore = require('../datastore/datastore');

module.exports.insertVariable = async (req, res, next) => {
    const name = req.query.name;
    const value = req.query.value;
    const jwt = req.headers.authorization.replace('Bearer ', '');

    try {
        await datastore.insertVatiable({ name, value }, jwt, (new Date()).toISOString() );
        res.status(200)
            .set('Content-Type', 'text/plain')
            .send(`${name} = ${value}`)
            .end()
    } catch (error) {
        next(error)
    }
}

module.exports.unsetVariable = async (req, res, next) => {
    const name = req.query.name;
    const jwt = req.headers.authorization.replace('Bearer ', '');
    
    try {
        await datastore.unsetVariable(name, jwt);
        res.status(200)
            .set('Content-Type', 'text/plain')
            .send(`${name} = None`)
            .end()
    } catch (error) {
        next(error)
    }
}

module.exports.getVariables = async (req, res, next) => {
    const query = datastore.createQuery('Variable').order('updated');

    try {
        datastore.runQuery(query).then((results) => {
            const variables = results[0].map((variable, i) => {
                return `${i + 1}. ${variable.name} = ${variable.value}`
            })
            res.status(200)
                .set('Content-Type', 'text/plain')
                .send(variables.join('\n'))
                .end()
        })
    } catch (error) {
        next(error)
    }
}

module.exports.deleteEntities = async (req, res, next) => {
    const query = datastore.createQuery('Variable');

    try {
        datastore.runQuery(query).then((results) => {
            const keys = results[0].map((variable) => {
                return variable[datastore.KEY];
            })
            datastore.delete(keys)
            .then(() => {
                res.status(200)
                .set('Content-Type', 'text/plain')
                .send('CLEANED')
                .end()
            });
            
        })
    } catch (error) {
        next(error)
    }
}

module.exports.getVariableValue = async (req, res, next) => {
    const name = req.query.name
    const jwt = req.headers.authorization.replace('Bearer ', '');

    try {
        const result = await datastore.getVariableValue(name, jwt)
        res.status(200)
            .set('Content-Type', 'text/plain')
            .send(
                `${result}`
            )
            .end()
    } catch (error) {
        next(error)
    }
}
