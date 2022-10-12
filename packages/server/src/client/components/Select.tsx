import { FC } from 'react';

interface SelectProps {
  name: string;
  label: string;
  value: string;
  required: boolean;
  nullMessage: string;
  error: string;
  options: { label: string; value: string; }[];
  onChange: (key: string, value: string) => any;
};

export const Select: FC = (props: SelectProps) => (
  <>
    <label htmlFor={ props.name }>{ props.label }</label>
    <select
      id={ props.name }
      value={ props.value || '' }
      required={ props.required }
      aria-invalid={ props.error ? 'true' : 'false' }
      onChange={ (event) => props.onChange(props.name, event.currentTarget.value) }
    >
      <option value="">{ props.nullMessage }</option>
      { props.options.map((option, idx) => (
        <option key={ `${props.name}-${idx}` } value={ option.value }>{ option.label }</option>
      )) }
    </select>
  </>
);
