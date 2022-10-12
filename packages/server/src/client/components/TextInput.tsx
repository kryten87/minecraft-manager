import { FC } from 'react';

interface TextInputProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  required: boolean;
  onChange: (key: string, value: string) => any;
};

export const TextInput: FC = (props: TextInputProps) => (
  <label htmlFor={ props.name }>
    { props.label }
    <input
      type="text"
      id={ props.name }
      name={ props.name }
      placeholder={ props.placeholder }
      value={ props.value }
      required={ !!props.required }
      onChange={ (event) => props.onChange(props.name, event.currentTarget.value) }
    />
  </label>
);
