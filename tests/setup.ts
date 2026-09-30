import { jest } from '@jest/globals';

jest.mock('expo-sqlite/localStorage/install', () => ({}));
