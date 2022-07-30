import { useState } from "react";

const placeholders = {
    set: ["Variable Name", "Variable Value"],
    get: ["Variable Name"],
    unset: ["Variable Name"],
    numequalto: ["Variable Value"],
}

const singleInput = ["get", "unset", "numequalto"];
const doubleInput = ["set"]

function Input({onRequest}) {
    const [formData, setFormData] = useState({ request: "set" });

    const handleSubmit = (e) => {
        e.preventDefault();
        const { request, ...other } = formData;
        onRequest(formData.request, other);
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData({...formData, [name]: value });
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <select name="request" style={{width: `${(8 * formData.request.length) + 50}px`}} className="form__request" value={formData.request} onChange={handleChange}>
                <option value="set" defaultChecked>SET</option>
                <option value="get">GET</option>
                <option value="unset">UNSET</option>
                <option value="numequalto">NUMEQUALTO</option>
                <option value="undo">UNDO</option>
                <option value="redo">REDO</option>
                <option value="end">END</option>
            </select>
            {singleInput.includes(formData.request) && (
                <>
                    <input className="form__input" name={formData.request === "numequalto" ? "value" : "name"} placeholder={placeholders[formData.request][0]} onChange={handleChange}/>
                </>
            )}
            {doubleInput.includes(formData.request) && (
                <>
                    <input className="form__input" name="name" placeholder={placeholders[formData.request][0]} onChange={handleChange}/>
                    <input className="form__input" name="value" placeholder={placeholders[formData.request][1]} onChange={handleChange}/>
                </>
            )}
            <button className="form__submit">Send</button>
        </form>
    )
}

export default Input;