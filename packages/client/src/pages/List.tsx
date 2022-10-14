import { FC, useState } from 'react';
import '@picocss/pico/css/pico.css';
import { StackList } from '../components/StackList';
import { Link } from 'react-router-dom';

export const List: FC = (props: Record<string, any>) => {
  const [stacks, setStacks] = useState(props?.containers || []);

  // @TODO on load, refresh stacks

  const onStackRefresh = (updatedStacks: any[]) => {
    setStacks(updatedStacks);
  };

  return (
    <div className="container" style={{ marginTop: '2em' }}>
      <StackList stacks={ stacks } onStackRefresh={ onStackRefresh } />
    </div>
  );
};
