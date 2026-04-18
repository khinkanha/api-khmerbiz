import path from 'path';
import dotenv from 'dotenv';

// Load test environment before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

process.env.NODE_ENV = 'test';
