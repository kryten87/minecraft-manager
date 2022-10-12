import { FC } from 'react';

interface CheckboxProps {
  name: string;
  label: string;
  value: boolean;
  onChange: (key: string, value: boolean) => any;
};

export const Checkbox: FC = (props: CheckboxProps) => (
  <label htmlFor={ props.name }>
    <input type="checkbox" id={ props.name } name={ props.name } defaultChecked={ !!props.value } onChange={ (event) => props.onChange(props.name, event.currentTarget.checked) } />
    { props.label }
  </label>
);
