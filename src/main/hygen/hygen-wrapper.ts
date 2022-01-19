import { engine, Logger, resolve } from 'hygen';
import { RunnerConfig, Prompter, ActionResult } from 'hygen/src/types';
import { command } from 'execa';
import enquirer from 'enquirer';

const configureHygen = (config?: RunnerConfig): RunnerConfig => ({
  cwd: process.cwd(),
  logger: new Logger(console.log.bind(console)),
  debug: !!process.env.DEBUG,
  exec: (action, body) => {
    const opts = body && body.length > 0 ? { input: body } : {};
    return command(action, { ...opts, shell: true });
  },
  createPrompter: <Q, T>() => enquirer as unknown as Prompter<Q, T>,
  ...(config || {}),
});

export async function runHygen(
  argv: string[],
  config?: RunnerConfig,
): Promise<ActionResult[]> {
  return engine(argv, await resolve(configureHygen(config)));
}
