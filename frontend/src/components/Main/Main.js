import Input from "../Input/Input";

function Main({onRequest, response, variables}) {
    return (
        <main className="main">
            <div className="fill_form">
                <Input onRequest={onRequest} />
                <h2 className="response">{response}</h2>
            </div>
            {Object.keys(variables).length > 0 ? 
                <ul className="variables">
                    {Object.keys(variables).map((key, index) => {
                        return <li key={index} className="variable">{key} = {variables[key]}</li>
                    })}
                </ul> : 
                <h2 className="variables__subtitle">You have no variables now. Please, create something...</h2>
            }
        </main>
    );
}

export default Main;