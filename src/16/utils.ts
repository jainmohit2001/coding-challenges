export const getParamWithoutSemiColor = (param: string): string => {
  if (param[0] === ':') {
    return param.substring(1, param.length);
  }
  return param;
};
