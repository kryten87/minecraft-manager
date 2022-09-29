export enum EnvironmentVariables {
  PORTAINER_URL = 'PORTAINER_URL',
  PORTAINER_USER = 'PORTAINER_USER',
  PORTAINER_PASSWORD = 'PORTAINER_PASSWORD',
}

export enum PortainerStatus {
  active = 1,
  inactive = 2,
}

export const Symbols = Object.freeze({
  Axios: Symbol('Axios'),
});
