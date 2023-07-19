import { main } from './cut';

const func = async () => {
  const result = await main();
  process.stdout.write(result);
};

func();
