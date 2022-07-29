const datastore = require('../datastore/datastore')

module.exports.insertVariable = async (req, res, next) => {
    const name = req.query.variable_name
    const value = req.query.variable_value
    const hash = req.headers.authorization

    try {
        await datastore.insertVatiable({ name, value }, hash)
        res.status(200)
            .set('Content-Type', 'text/plain')
            .send(`${name} = ${value}`)
            .end()
    } catch (error) {
        next(error)
    }
}

module.exports.getVariables = async (req, res, next) => {
    const query = datastore.createQuery('Variable')

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

module.exports.getVariable = async (req, res, next) => {
    const name = req.query.variable_name

    try {
        const result = await getVariable(name)
        console.log(result)
        res.status(200)
            .set('Content-Type', 'text/plain')
            .send(
                `Variable Name: ${result.name}, Variable Value: ${result.value}`
            )
            .end()
    } catch (error) {
        next(error)
    }
}
