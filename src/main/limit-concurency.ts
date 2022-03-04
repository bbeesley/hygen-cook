import pLimit from 'p-limit';
import os from 'os';

/**
 * Limits concurency to the number of CPUs.
 */
export const limitConcurrency = pLimit(os.cpus().length);
