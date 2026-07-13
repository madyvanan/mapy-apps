import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export default async function teardown() {
  const container = (global as Record<string, unknown>).__PG_CONTAINER__ as StartedPostgreSqlContainer;
  if (container) await container.stop();
}
