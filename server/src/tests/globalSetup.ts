import 'dotenv/config';
import { assertSafeTestEnvironment } from './helpers/testDatabase';

export default async function globalSetup(): Promise<void> {
  assertSafeTestEnvironment();
}
