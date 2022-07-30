import Main from '../Main/Main';
import { getAllVariables, getVariable, setVariable, unsetVariable, getNumEqualTo, undo, redo, end } from '../../utils/queries';
import { register, logout } from '../../utils/auth';
import { useEffect, useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt'));
  const [variables, setVariables] = useState({});
  const [response, setResponse] = useState("");

  const handleRequest = async (request, data) => {
    const undoRedo = async callback => {
      const response = await callback(token);
      if (typeof response === 'object') {
        setVariables({...variables, [Object.keys(response)[0]] : Object.values(response)[0]});
        return `${Object.keys(response)[0]} = ${Object.values(response)[0]}`;
      }
      return response;
    }

    const validateRequest = (response, callback) => {
      !!response.message ? setResponse(response.message) : callback();
    }

    switch (request) {
      case 'set':
        const responseFromSet = await setVariable(token, data);
        validateRequest(responseFromSet, () => {
          setVariables({...variables, [data.name] : data.value});
          setResponse(`${data.name} = ${data.value}`);
        });
        break;
      case 'get':
        const receivedValue = await getVariable(token, data.name);
        validateRequest(receivedValue, () => {
          setResponse(`${Object.keys(receivedValue)[0]} = ${Object.values(receivedValue)[0]}`);
        })
        break;
      case 'unset':
        const unsetValue = await unsetVariable(token, data.name);
        validateRequest(unsetValue, () => {
          setVariables({...variables, [data.name] : 'None'});
        })
        break;
      case 'numequalto':
        const variablesCount = await getNumEqualTo(token, data.value);
        validateRequest(variablesCount, () => {
          setResponse(variablesCount);
        })
        break;
      case 'undo':
        const undoResponse = await undoRedo(undo);
        setResponse(undoResponse);
        break;
      case 'redo':
        const redoResponse = await undoRedo(redo);
        setResponse(redoResponse);
        break;
      case 'end':
        const endResponse = await end(token);
        setVariables({});
        setResponse(endResponse);
        break;
      default:
        break;
    }
  };

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
    const handleTabClose = async (event) => {
      event.preventDefault();
      await end(localStorage.getItem('jwt'));
      setVariables({});
      setResponse("");
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  return (
    <div className="app">
      <Main onRequest={handleRequest} variables={variables} response={response}/>
    </div>
  );
}

export default App;
