/**
 * Creates a chainable mock query builder for Objection.js model mocking.
 * All chainable methods return `this` so they can be chained.
 * Terminal methods (first, insert, etc.) resolve with mock data.
 */
export function createMockQueryBuilder(resolvedValue: unknown = null) {
  const qb: Record<string, jest.Mock> = {};

  const chainable = (..._args: unknown[]) => {
    qb._lastCall = _args;
    return qb;
  };

  // Chainable methods
  const chainableMethods = [
    'where', 'whereIn', 'whereNotNull', 'whereNull', 'whereRaw',
    'findById', 'findByIds',
    'withGraphFetched', 'withGraph',
    'orderBy', 'limit', 'offset', 'clone',
    'patch', 'patchAndFetchById', 'del', 'deleteById',
    'count', 'countDistinct', 'sum', 'min', 'max', 'avg',
    'select', 'join', 'leftJoin', 'rightJoin',
    'groupBy', 'having', 'distinct',
    'range', 'page',
    'modify', 'context',
  ];

  for (const method of chainableMethods) {
    qb[method] = jest.fn(chainable);
  }

  // Terminal methods — return promises
  qb.first = jest.fn().mockResolvedValue(resolvedValue);
  qb.insert = jest.fn().mockResolvedValue(resolvedValue);
  qb.insertGraph = jest.fn().mockResolvedValue(resolvedValue);
  qb.update = jest.fn().mockResolvedValue(resolvedValue);
  qb.updateAndFetch = jest.fn().mockResolvedValue(resolvedValue);
  qb.delete = jest.fn().mockResolvedValue(resolvedValue);
  qb.then = jest.fn((resolve: (v: unknown) => void) => Promise.resolve(resolvedValue).then(resolve));
  qb.toThrow = jest.fn();

  return qb;
}

/**
 * Mock an Objection.js model class.
 * Returns an object with a `query` method that returns a mock query builder.
 */
export function createMockModel(defaultResolvedValue: unknown = null) {
  const queryBuilder = createMockQueryBuilder(defaultResolvedValue);

  return {
    query: jest.fn(() => queryBuilder),
    _queryBuilder: queryBuilder,
    tableName: 'mock_table',
    getByName: jest.fn().mockResolvedValue(defaultResolvedValue),
    getByUsername: jest.fn().mockResolvedValue(defaultResolvedValue),
    isEmailExist: jest.fn().mockResolvedValue(false),
  };
}

/**
 * Reset all mock functions on a mock model.
 */
export function resetMockModel(mockModel: ReturnType<typeof createMockModel>) {
  mockModel.query.mockClear();
  mockModel._queryBuilder.first.mockClear();
  mockModel._queryBuilder.insert.mockClear();
  mockModel.getByName.mockClear();
  mockModel.getByUsername.mockClear();
  mockModel.isEmailExist.mockClear();
}
