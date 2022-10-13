import { FC } from 'react';

interface TextInputProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  required?: boolean;
  error?: string;
  onChange: (key: string, value: string) => any;
};

export const TextInput: FC<TextInputProps> = (props: TextInputProps) => (
  <label htmlFor={ props.name }>
    { props.label }
    <input
      type="text"
      id={ props.name }
      name={ props.name }
      placeholder={ props.placeholder }
      value={ props.value }
      required={ !!props.required }
      aria-invalid={ props.error ? 'true' : 'false' }
      onChange={ (event) => props.onChange(props.name, event.currentTarget.value) }
    />
  </label>
);
