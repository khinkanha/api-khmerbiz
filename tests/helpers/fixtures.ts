export function createTestUser(overrides: Record<string, unknown> = {}) {
  return {
    userid: 1,
    username: 'testuser',
    domain_id: 1,
    full_name: 'Test User',
    phone: '+85512345678',
    email: 'test@example.com',
    user_level: 2,
    sitebuilder: 0,
    password: '$2a$12$hashedpassword',
    verify_code: null,
    domain: { domain_id: 1, domain_name: 'example.com', status: 1 },
    ...overrides,
  };
}

export function createTestDomain(overrides: Record<string, unknown> = {}) {
  return {
    domain_id: 1,
    domain_name: 'example.com',
    company_name: 'Test Company',
    status: 1, // ACTIVE
    ...overrides,
  };
}

export function createSuperAdmin(overrides: Record<string, unknown> = {}) {
  return createTestUser({
    userid: 99,
    username: 'superadmin',
    user_level: -1,
    domain_id: 0,
    ...overrides,
  });
}

export function createWebAdmin(overrides: Record<string, unknown> = {}) {
  return createTestUser({
    userid: 2,
    username: 'webadmin',
    user_level: 1,
    domain_id: 1,
    ...overrides,
  });
}

export function createTestContent(overrides: Record<string, unknown> = {}) {
  return {
    content_id: 1,
    domain_id: 1,
    title: 'Test Content',
    content_type: 0,
    description: '<p>Test description</p>',
    menu_id: 1,
    ...overrides,
  };
}

export function createTestMedia(overrides: Record<string, unknown> = {}) {
  return {
    photo_id: 1,
    file_name: 'photos/1234567890-abc123.jpg',
    domain_id: 1,
    code: 'abc123hash',
    title: 'Test Photo',
    server_id: 1,
    ...overrides,
  };
}
