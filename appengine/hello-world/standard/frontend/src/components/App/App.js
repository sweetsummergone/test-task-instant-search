import Main from '../Main/Main';
import { getAllVariables, setVariable, unsetVariable } from '../../utils/queries';
import { register, logout } from '../../utils/auth';
import { useEffect, useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt'));
  const [variables, setVariables] = useState({});

  const handleRequest = async (request, data) => {
    switch (request) {
      case 'set':
        await setVariable(token, data);
        setVariables({...variables, [data.name] : data.value});
        break;
      case 'unset':
        await unsetVariable(token, data.name);
        setVariables({...variables, [data.name] : 'None'});
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    console.log(variables);
  }, [variables])

  useEffect(() => {
    if (!token) {
      register().then((res) => {
        if (res.token) {
          setToken(res.token);
          localStorage.setItem('jwt', res.token);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getAllVariables(token).then((res) => setVariables(res));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleTabClose = (event) => {
      event.preventDefault();
      logout(localStorage.getItem('jwt'));
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  return (
    <div className="app">
      <Main onRequest={handleRequest} variables={variables} />
    </div>
  );
}

export default App;
