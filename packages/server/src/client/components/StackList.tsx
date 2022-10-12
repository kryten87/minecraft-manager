import { FC, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { PortainerStatus, StackListAction } from '../../shared/types';
import axios from 'axios';

interface Props {
  stacks: any[];
  onStackRefresh: (stacks: any[]) => void;
}

export const StackList: FC = (props: Props) => {
  const { onStackRefresh } = props;

  const [stacks, setStacks] = useState(props.stacks || []);
  const [isProcessing, setIsProcessing] = useState(false);

  const startStack = (id: number) => axios.get(`/api/start/${id}`);
  const stopStack = (id: number) => axios.get(`/api/stop/${id}`);
  const stopAllStacks = () => Promise.all(
    stacks.map((stack) => stack.status === PortainerStatus.active ? stopStack(stack.id) : Promise.resolve())
  );
  const getStacks = () => axios.get('/api/list');

  const refreshStacks = async () => {
    setIsProcessing(true);
    const { data } = await getStacks();
    setStacks(data);
    onStackRefresh(data);
    setIsProcessing(false);
  };

  const onButtonClick = async (action: StackListAction, id: number) => {
    setIsProcessing(true);

    if (action === StackListAction.start) {
      await stopAllStacks(id);
      await startStack(id);
    } else if (action === StackListAction.stop) {
      await stopStack(id);
    }

    await refreshStacks();

    setIsProcessing(false);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Owner</th>
          <th>&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        { stacks.map((stack) => (
          <tr key={ `stack-${stack.id}` }>
            <td>{ stack.name }</td>
            <td>{ stack.status === PortainerStatus.active ? (<kbd>Active</kbd>) : 'Inactive' }</td>
            <td>{ stack.owner }</td>
            <td>
              {stack.status === PortainerStatus.active && (
                <button disabled={ isProcessing } onClick={ () => onButtonClick(StackListAction.stop, stack.id) }>
                  Stop
                </button>
              ) }
              {stack.status === PortainerStatus.inactive && (
                <button disabled={ isProcessing } onClick={ () => onButtonClick(StackListAction.start, stack.id) }>
                  Start
                </button>
              ) }
            </td>
          </tr>
        )) }
      </tbody>
    </table>
  );
};