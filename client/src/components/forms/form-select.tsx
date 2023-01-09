import { ChangeEvent } from "react"
import Case from 'case'
import { Form } from 'react-bootstrap'

interface SelectOption {
    label: string
    value: string
    description: string
}

export const FormSelect = ({ value, selectOptions, name, options, injectables, onChange}: {
    value: string,
    selectOptions: SelectOption[],
    name: string,
    onChange(value: string): void,
    injectables?: JSX.Element[],
    options?: {
        [key:string]: string | number | boolean | RegExp
    }
}) => {
    
    const {helpMessage, formFeedback, labelText, ...opts} = options ?? {};
    
    const fieldLable = labelText as string ?? Case.capital(name);

    const onSelectChange = (event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)

    return (
        <div className="form-group">
            <label htmlFor={name}>{fieldLable}</label>
            <select
                id={name}
                value={value}
                onChange={onSelectChange}
                {...opts}
            >
            {selectOptions.map((selectOptions, idx) => (
                <option key={`${name}-${idx}`} value={selectOptions.value}>
                {selectOptions.description}
                </option>
            ))}
            </select>
            {
                formFeedback ?
                <Form.Control.Feedback type="invalid">
                    {formFeedback as string}
                </Form.Control.Feedback> : null
            }
            {
                injectables ? injectables : null
            }
            {
                options?.helpMessage ?
                <small id={`${name}Help`} className="form-text text-muted">{options.helpMessage as string}</small> : null
            }
        </div>
    )
}