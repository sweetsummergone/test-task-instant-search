export const BASE_URL = 'http://localhost:8080';

export const register = () => {
  return fetch(`${BASE_URL}/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    return res.json();
  });
};

export const logout = (token) => {
  return fetch(`${BASE_URL}/end`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => {
    localStorage.removeItem('jwt');
    return res.json();
  });
};
