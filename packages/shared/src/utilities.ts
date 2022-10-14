export const camelCaseToSnakeCase = (str: string): string => {
  return str
    .split(/\.?(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export const objectToEnvValues = (
  obj: Record<string, any>,
): Record<string, any> => {
  const res = {};
  Object.keys(obj).forEach((key) => {
    res[camelCaseToSnakeCase(key).toUpperCase()] = obj[key];
  });
  return res;
};

export const createStackName = (name: string): string => {
  return `${name}`.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/[ ]+/g, '_');
};
