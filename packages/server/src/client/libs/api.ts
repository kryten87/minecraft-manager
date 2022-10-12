import axios from 'axios';
import { PortainerStatus } from '../../shared/types';

export const startStack = (id: number) => axios.get(`/api/start/${id}`);

export const stopStack = (id: number) => axios.get(`/api/stop/${id}`);

export const stopAllStacks = (stacks: any[]) =>
  Promise.all(
    stacks.map((stack) =>
      stack.status === PortainerStatus.active
        ? stopStack(stack.id)
        : Promise.resolve(),
    ),
  );

export const getStacks = () => axios.get('/api/list');
