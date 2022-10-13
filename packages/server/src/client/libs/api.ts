import axios from 'axios';
import {
  MinecraftStackMetadata,
  MinecraftStackConfig,
  PortainerStatus,
} from '@minecraft-manager/shared';

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

export const createStack = (
  config: Partial<MinecraftStackConfig>,
  metadata: Partial<MinecraftStackMetadata>,
) => {
  return axios.post('/api/create', { ...config, ...metadata }, {});
};
