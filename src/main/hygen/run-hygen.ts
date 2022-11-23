import { engine, Logger, resolve } from 'hygen';
import {
  type RunnerConfig,
  type Prompter,
  type ActionResult,
} from 'hygen/src/types';
import { command, type ExecaChildProcess } from 'execa';
import enquirer from 'enquirer';

/**
 * Creates an exec function with the hygen runner configuration.
 *
 * @param {RunnerConfig} config The hygen runner configuration.
 * @returns {(action: string, body: string) => ExecaChildProcess<string>} The exec function.
 */
function execFn(
  config?: RunnerConfig,
): (action: string, body: string) => ExecaChildProcess {
  return (action, body) => {
    const options = body && body.length > 0 ? { input: body } : {};
    return command(action, {
      ...options,
      env: process.env,
      cwd: config?.cwd ?? process.cwd(),
      shell: true,
    });
  };
}

/**
 * Returns the prompter for configuring hygen.
 * Uses enquirer from the npm package enquirer (@see https://github.com/enquirer/enquirer).
 *
 * @returns
 */
function createPrompter<Q, T>(): Prompter<Q, T> {
  return enquirer as unknown as Prompter<Q, T>;
}

/**
 * Appends additional configs to the runner config.
 *
 * @param {RunnerConfig} config The runner configuration.
 * @returns {RunnerConfig}
 */
function configureHygen(config?: RunnerConfig): RunnerConfig {
  return {
    cwd: process.cwd(),
    logger: new Logger(console.log.bind(console)),
    exec: execFn(config),

    debug: Boolean(process.env['DEBUG']),
    createPrompter,
    ...config,
  };
}

/**
 * A wrapper on top of hygen, that sets the hygen runner configuration.
 *
 * @param {string[]} argv Arguments to call hygen with.
 * @param {RunnerConfig} config The runner configuration.
 * @returns {Promise<ActionResult[]>}
 */
export async function runHygen(
  argv: string[],
  config?: RunnerConfig,
): Promise<ActionResult[]> {
  return engine(argv, await resolve(configureHygen(config)));
}
