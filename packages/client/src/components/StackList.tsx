import { FC, useEffect, useState } from 'react';
import { PortainerStatus, StackListAction } from '@minecraft-manager/shared';
import { startStack, stopStack, stopAllStacks, getStacks } from '../libs/api';

interface Props {
}

export const StackList: FC<Props> = (props: Props) => {
  const [stacks, setStacks] = useState(undefined as any[] | undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (stacks === undefined) {
      getStacks().then(({ data }) => {
        setStacks(data);
      });
    }
  });

  const refreshStacks = async () => {
    setIsProcessing(true);
    const { data } = await getStacks();
    setStacks(data);
    setIsProcessing(false);
  };

  const onButtonClick = async (action: StackListAction, id: number) => {
    setIsProcessing(true);
    if (action === StackListAction.start) {
      await stopAllStacks(stacks || []);
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
        { (stacks || []).map((stack) => (
          <tr key={ `stack-${stack.id}` }>
            <td>
              <strong>{ stack.name }</strong>
              { (stack.description || '').split('\n').map((line: string) => (
                <p style={{ marginBottom: '0.2em' }}><small style={{ color: '#888' }}>{ line }</small></p>
              )) }
            </td>
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