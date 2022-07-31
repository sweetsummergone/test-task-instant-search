// export const BASE_URL = 'http://localhost:8080';
export const BASE_URL = 'https://getting-hire.ew.r.appspot.com';

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
