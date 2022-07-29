const datastore = require('../datastore/datastore');

const sendSuccessResponce = (res, string) => {
    res.status(200)
        .set('Content-Type', 'text/plain')
        .send(string)
        .end();
}

module.exports.insertVariable = async (req, res, next) => {
    const name = req.query.name;
    const value = req.query.value;
    const jwt = req.headers.authorization.replace('Bearer ', '');

    try {
        await datastore.insertVatiable({ name, value }, jwt, (new Date()).toISOString() );
        sendSuccessResponce(res, `${name} = ${value}`);
    } catch (error) {
        next(error)
    }
};

module.exports.unsetVariable = async (req, res, next) => {
    const name = req.query.name;
    const jwt = req.headers.authorization.replace('Bearer ', '');
    
    try {
        await datastore.unsetVariable(name, jwt);
        sendSuccessResponce(res, `${name} = None`);
    } catch (error) {
        next(error)
    }
};

module.exports.getNumEqualTo = async (req, res, next) => {
    const value = req.query.value;
    const jwt = req.headers.authorization.replace('Bearer ', '');

    try {
       const count = await datastore.getNumEqualTo(value, jwt);
       sendSuccessResponce(res, `${count}`);
    } catch (error) {
        next(error);
    }
};

// Temponary function for debug
module.exports.getVariables = async (req, res, next) => {
    const query = datastore.createQuery('Variable').order('updated');

    try {
        datastore.runQuery(query).then((results) => {
            const variables = results[0].map((variable, i) => {
                return `${i + 1}. ${variable.name} = ${variable.value}`
            });
            sendSuccessResponce(res, variables.join('\n'));
        })
    } catch (error) {
        next(error)
    }
};
//

module.exports.deleteEntities = async (req, res, next) => {
    const jwt = req.headers.authorization.replace('Bearer ', '');

    try {
        const result = await datastore.clear(jwt);
        sendSuccessResponce(res, result);
    } catch (error) {
        next(error)
    }
};

module.exports.getVariableValue = async (req, res, next) => {
    const name = req.query.name;
    const jwt = req.headers.authorization.replace('Bearer ', '');

    try {
        const result = await datastore.getVariableValue(name, jwt);
        sendSuccessResponce(res, `${result}`);
    } catch (error) {
        next(error)
    }
};

module.exports.undo = async (req, res, next) => {
    const jwt = req.headers.authorization.replace('Bearer ', '');
    try {
        const result = await datastore.undo(jwt);
        sendSuccessResponce(res, `${result}`);
    } catch (error) {
        next(error)
    }
}

module.exports.redo = async (req, res, next) => {
    const jwt = req.headers.authorization.replace('Bearer ', '');
    try {
        const result = await datastore.redo(jwt);
        sendSuccessResponce(res, `${result}`);
    } catch (error) {
        next(error)
    }
}