import { FC, useEffect, useState } from 'react';
import '@picocss/pico/css/pico.css';
import { GetServerSideProps } from 'next';
import { PortainerStatus, StackListAction } from '../shared/types';
import axios from 'axios';
import { StackList } from '../client/components/StackList';

const pause = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

const Home: FC = (props: Record<string, any>) => {
  const [stacks, setStacks] = useState(props?.containers || []);
  const [isShowingList, setIsShowingList] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const onStackRefresh = (stacks: any[]) => {
    setStacks(stacks);
  };

  return (
    <div className="container">
      <h1>Minecraft Servers</h1>
      { isShowingList
        ? (<StackList stacks={ stacks } onStackRefresh={ onStackRefresh } />)
        : (<div>not implemented</div>)
      }
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps<any> = async (ctx) => {
  return {
    props: { containers: ctx?.query?.containers || [] }
  };
};