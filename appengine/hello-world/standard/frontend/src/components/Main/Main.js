import Input from "../Input/Input";

function Main({onRequest, responce, variables}) {
    return (
        <main className="main">
            <Input onRequest={onRequest} />
            <h2 className="responce">{responce}</h2>
            {Object.keys(variables).length > 0 ? <ul className="variables">
                {Object.keys(variables).map((key, index) => {
                    return <li key={index} className="variable">{key} = {variables[key]}</li>
                })}
            </ul> : 
            <h2 className="variables__subtitle">You have no variables now. Please, create something...</h2>}
        </main>
    );
}

export default Main;