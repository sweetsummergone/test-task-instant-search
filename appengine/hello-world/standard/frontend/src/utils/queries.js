export const BASE_URL = 'http://localhost:8080';

export const getAllVariables = (token) => {
  return fetch(`${BASE_URL}/all`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    return res.json();
  });
};

export const setVariable = (token, data) => {
    return fetch(`${BASE_URL}/set?name=${data.name}&value=${data.value}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        return res.json();
    })
}

export const unsetVariable = (token, name) => {
    return fetch(`${BASE_URL}/unset?name=${name}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        return res.json();
    })
}