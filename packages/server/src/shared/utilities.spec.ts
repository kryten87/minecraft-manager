import { createStackName } from '@minecraft-manager/shared';

describe('createStackName', () => {
  it('should return the expected value', () => {
    [
      { name: 'hello', expected: 'hello' },
      { name: 'hello world', expected: 'hello_world' },
      { name: 'hello  world       today', expected: 'hello_world_today' },
      { name: 'hello#world', expected: 'helloworld' },
      { name: '42-hello', expected: '42-hello' },
      { name: 'someThing', expected: 'someThing' },
      {
        name: 'nice `~!@#$%^&*()+=[]{}|;:\'",.<>/? world',
        expected: 'nice_world',
      },
    ].forEach(({ name, expected }) => {
      const res = createStackName(name);
      expect(res).toBe(expected);
    });
  });
});
