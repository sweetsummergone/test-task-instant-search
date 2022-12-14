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
        const {name, value} = e.target;
        if (value.match(/[^A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=]/g) === null) setFormData({...formData, [name]: value });
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="inputs">
                <select name="request" className="form__request" value={formData.request} onChange={handleChange}>
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
                        <input required className="form__input" value={formData.request === "numequalto" ? formData.value || "" : formData.name || ""} name={formData.request === "numequalto" ? "value" : "name"} placeholder={placeholders[formData.request][0]} onChange={handleChange}/>
                    </>
                )}
                {doubleInput.includes(formData.request) && (
                    <>
                        <input required className="form__input" value={formData.name || ""} name="name" placeholder={placeholders[formData.request][0]} onChange={handleChange}/>
                        <input required className="form__input" value={formData.value || ""} name="value" placeholder={placeholders[formData.request][1]} onChange={handleChange}/>
                    </>
                )}
            </div>
            <div className="form__button">
                <button className="form__submit">Send</button>
            </div>
        </form>
    )
}

export default Input;