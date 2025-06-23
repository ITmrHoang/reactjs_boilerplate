// src/mocks/browser.js

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Xuất ra worker đã được cấu hình với các handlers ở trên
export const worker = setupWorker(...handlers);