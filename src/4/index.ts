import { unixCut } from './cut';

const func = async () => {
  const result = await unixCut();
  process.stdout.write(result);
};

func();
