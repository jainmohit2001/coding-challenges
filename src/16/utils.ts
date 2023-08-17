export const getParamWithoutSemiColon = (param: string | undefined): string => {
  if (param == undefined) {
    return '';
  }
  if (param[0] === ':') {
    return param.substring(1, param.length);
  }
  return param;
};
