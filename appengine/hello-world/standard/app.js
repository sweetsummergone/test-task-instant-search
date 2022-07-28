// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START gae_node_request_example]
const express = require('express');
const {Datastore} = require('@google-cloud/datastore');

const app = express();

const datastore = new Datastore({
  projectId: 'getting-hire',
});

const insertVariable = (variable) => {
  return datastore.save({
    key: datastore.key('variable'),
    data: variable
  });
}

const getVisits = () => {
  const query = datastore
    .createQuery('variable')
    .limit(10);

  return datastore.runQuery(query);
};

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

app.get('/set', async (req, res, next) => {
  const name = req.query.variable_name;
  const value = req.query.variable_value;

  try {
    await insertVariable({name, value});
    const [entities] = await getVisits();
    const variables = entities.map(
      entity => `Variable Name: ${entity.name}, Variable Value: ${entity.value}`
    );
    res
    .status(200)
    .set('Content-Type', 'text/plain')
    .send(`Last 10 variables:\n${variables.join('\n')}`)
    .end();
  } catch (error) {
    next(error);
  }
});

// Start the server
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END gae_node_request_example]

module.exports = app;
