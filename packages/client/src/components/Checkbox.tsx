import { FC } from 'react';

interface CheckboxProps {
  name: string;
  label: string;
  value: boolean;
  error?: string;
  onChange: (key: string, value: boolean) => any;
};

export const Checkbox: FC<CheckboxProps> = (props: CheckboxProps) => (
  <label htmlFor={ props.name }>
    <input
      type="checkbox"
      id={ props.name }
      name={ props.name }
      defaultChecked={ !!props.value }
      aria-invalid={ props.error ? 'true' : 'false' }
      onChange={ (event) => props.onChange(props.name, event.currentTarget.checked) }
    />
    { props.label }
  </label>
);
