import { FC, useState } from 'react';
import '@picocss/pico/css/pico.css';
import { GetServerSideProps } from 'next';
import { StackList } from '../client/components/StackList';

const Home: FC = (props: Record<string, any>) => {
  const [stacks, setStacks] = useState(props?.containers || []);

  const onStackRefresh = (updatedStacks: any[]) => {
    setStacks(updatedStacks);
  };

  return (
    <div className="container" style={{ marginTop: '2em' }}>
      <div className="grid">
        <div><h1>Servers</h1></div>
        <div><a href="/create" role="button" style={{ float: "right" }}>Add New...</a></div>
      </div>
      <StackList stacks={ stacks } onStackRefresh={ onStackRefresh } />
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<any> = async (ctx) => {
  return {
    props: { containers: ctx?.query?.containers || [] }
  };
};