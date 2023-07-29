import { Calculator } from './calculator';

if (process.argv.length <= 2) {
  console.error('Invalid usage. Please provide a string to process');
  process.exit(1);
}

const calculator = new Calculator(process.argv[2]);
try {
  const output = calculator.calculate();
  console.log(output);
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
