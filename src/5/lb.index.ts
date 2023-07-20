import { SchedulingAlgorithm } from './enum';
import { LBServer } from './lb';

try {
  const port = parseInt(process.argv[2]);
  new LBServer(port, SchedulingAlgorithm.ROUND_ROBIN, 10 * 1000);
} catch (err) {
  console.error('Invalid port provided');
  process.exit(1);
}
