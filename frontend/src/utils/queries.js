export const BASE_URL = 'https://getting-hire.ew.r.appspot.com';

const _customFetch = (token, url) => {
  return fetch(`${BASE_URL}/${url}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    res.text().then((text) => console.log(text));
    return res.json();
  });
}

export const getAllVariables = (token) => {
  return _customFetch(token, 'all');
};

export const setVariable = (token, data) => {
  return _customFetch(token, `set?name=${data.name}&value=${data.value}`);
}

export const getVariable = (token, name) => {
  return _customFetch(token, `get?name=${name}`);
}

export const unsetVariable = (token, name) => {
  return _customFetch(token, `unset?name=${name}`);
}

export const getNumEqualTo = (token, value) => {
  return _customFetch(token, `numequalto?value=${value}`);
}

export const undo = (token) => {
  return _customFetch(token, 'undo');
}

export const redo = (token) => {
  return _customFetch(token, 'redo');
}

export const end = (token) => {
  return _customFetch(token, 'end');
}