import { FC, useState } from 'react';
import { PortainerStatus, StackListAction } from '../../shared/types';
import { startStack, stopStack, stopAllStacks, getStacks } from '../libs/api';

interface Props {
  stacks: any[];
  onStackRefresh: (stacks: any[]) => void;
}

export const StackList: FC = (props: Props) => {
  const { onStackRefresh } = props;

  const [stacks, setStacks] = useState(props.stacks || []);
  const [isProcessing, setIsProcessing] = useState(false);

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
      await stopAllStacks(stacks);
      await startStack(id);
    } else if (action === StackListAction.stop) {
      await stopStack(id);
    }
    await refreshStacks();
    setIsProcessing(false);
  };

  return (
    <table role="grid">
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