import { FC, useEffect, useState } from 'react';
import '@picocss/pico/css/pico.css';
import { GetServerSideProps } from 'next';

const Home: FC = (props: Record<string, any>) => {
  return (
    <div>
      <h1>Home</h1>
      <pre>{ JSON.stringify(props.containers, null, 2) }</pre>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<any> = async (ctx) => {
  return {
    props: { containers: ctx?.query?.containers || [] }
  };
};