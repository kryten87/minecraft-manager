import { FC, useState } from 'react';
import '@picocss/pico/css/pico.css';
import { GetServerSideProps } from 'next';

const Create: FC = (props: Record<string, any>) => {
  return (
    <div className="container">
      <h1>Servers</h1>
      <p>this is the create form</p>
    </div>
  );
};

export default Create;

export const getServerSideProps: GetServerSideProps<any> = async (ctx) => {
  return {
    props: {}
  };
};