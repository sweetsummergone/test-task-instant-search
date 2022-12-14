import Main from '../Main/Main';
import { getVariable, setVariable, unsetVariable, getNumEqualTo, undo, redo, end } from '../../utils/queries';
import { register } from '../../utils/auth';
import { useEffect, useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('jwt'));
  const [variables, setVariables] = useState({});
  const [response, setResponse] = useState("");

  const handleRequest = async (request, data) => {
    const validateRequest = (response, callback) => {
      !!response.message ? setResponse(response.message) : callback();
    }

    const undoRedo = async callback => {
      const response = await callback(token);
      validateRequest(response, () => {
        if (typeof response === 'object') {
          setVariables({...variables, [Object.keys(response)[0]] : Object.values(response)[0]});
          setResponse(`${Object.keys(response)[0]} = ${Object.values(response)[0]}`);
        } else {
          setResponse(response);
        }
      });
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
          setResponse(`${Object.values(receivedValue)[0]}`);
        })
        break;
      case 'unset':
        const unsetValue = await unsetVariable(token, data.name);
        validateRequest(unsetValue, () => {
          setVariables({...variables, [data.name] : 'None'});
          setResponse(`${[data.name]} = None`)
        })
        break;
      case 'numequalto':
        const variablesCount = await getNumEqualTo(token, data.value);
        validateRequest(variablesCount, () => {
          setResponse(variablesCount);
        })
        break;
      case 'undo':
        await undoRedo(undo);
        break;
      case 'redo':
        await undoRedo(redo);
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
    const handleTabClose = (event) => {
      event.preventDefault();
      end(localStorage.getItem('jwt'));
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
