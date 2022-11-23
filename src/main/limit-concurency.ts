import os from 'node:os';
import pLimit from 'p-limit';

/**
 * Limits concurency to the number of CPUs.
 */
export const limitConcurrency = pLimit(os.cpus().length);
