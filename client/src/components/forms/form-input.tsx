import { ChangeEvent } from "react"
import Case from 'case'
import { Form } from "react-bootstrap"


export const FormInput = ({ inputType, value, name, options, onChange }: {
    inputType: string,
    value: string | number,
    name: string,
    onChange(value: string): void
    options?: {
        [key:string]: string | number | boolean | RegExp
    }
}) => {

    const {helpMessage, formFeedback, labelText, ...opts} = options ?? {};
    
    const fieldLable = labelText as string ?? Case.capital(name);
    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)

    return (
        inputType === "checkbox" ? 
        <div className="form-group">
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    value={value}
                    id={name}
                    onChange={onInputChange}
                    {...opts}
                />
                <label className="form-check-label" htmlFor="useUserIp">
                    {fieldLable}
                </label>
            </div>
        </div>
        :  
        <div className="form-group">
            <label htmlFor={name}>{fieldLable}</label>
            <input
                id={name}
                type={inputType}
                value={value}
                name={name}
                aria-describedby={`${name}Help`}
                onChange={onInputChange}
                {...opts}
            />
            {
                formFeedback ?
                <Form.Control.Feedback type="invalid">
                    {formFeedback as string}
                </Form.Control.Feedback> : null
            }
            {
                helpMessage ?
                <small id={`${name}Help`} className="form-text text-muted">{helpMessage as string}</small> : null
            }
        </div>
    )
}