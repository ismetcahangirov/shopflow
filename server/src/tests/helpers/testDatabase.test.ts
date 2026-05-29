import { assertSafeTestEnvironment } from './testDatabase';

describe('assertSafeTestEnvironment', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('allows test environment with a non-production database URL', () => {
    process.env.NODE_ENV = 'test';

    expect(() =>
      assertSafeTestEnvironment('postgresql://postgres:postgres@localhost:5432/shopflow_test')
    ).not.toThrow();
  });

  it('rejects non-test NODE_ENV', () => {
    process.env.NODE_ENV = 'development';

    expect(() =>
      assertSafeTestEnvironment('postgresql://postgres:postgres@localhost:5432/shopflow_test')
    ).toThrow('NODE_ENV=test');
  });

  it('rejects missing DATABASE_URL', () => {
    process.env.NODE_ENV = 'test';
    delete process.env.DATABASE_URL;

    expect(() => assertSafeTestEnvironment()).toThrow('DATABASE_URL');
  });

  it('rejects production-like database URLs', () => {
    process.env.NODE_ENV = 'test';

    expect(() =>
      assertSafeTestEnvironment('postgresql://postgres:postgres@db.example.com:5432/shopflow_prod')
    ).toThrow('production-like');
  });
});
