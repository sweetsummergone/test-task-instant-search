import Main from "../Main/Main";
import { register, logout } from "../../utils/auth"; 
import { useEffect } from "react";

function App() {

  useEffect(() => {
    if (!localStorage.getItem("jwt")) {
      register();
    }
  }, []);

  useEffect(() => {
    const handleTabClose = event => {
      event.preventDefault();
      logout(localStorage.getItem("jwt"));
    };

    window.addEventListener('beforeunload', handleTabClose);

    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  return (
    <body className="app">
      <Main />
    </body>
  );
}

export default App;
