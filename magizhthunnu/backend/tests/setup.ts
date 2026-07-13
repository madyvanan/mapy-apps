import { execSync } from 'child_process';
import path from 'path';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export default async function setup() {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer('postgis/postgis:16-3.4')
    .withDatabase('magizhthunnu_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const databaseUrl = container.getConnectionUri();
  process.env['DATABASE_URL'] = databaseUrl;
  process.env['JWT_SECRET'] = 'test-jwt-secret-32chars-minimum!!';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-32chars-min!!';
  process.env['NODE_ENV'] = 'test';

  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  (global as Record<string, unknown>).__PG_CONTAINER__ = container;
}
