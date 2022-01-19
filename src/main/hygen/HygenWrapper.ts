import { engine, Logger, resolve } from 'hygen';
import { RunnerConfig, Prompter, ActionResult } from 'hygen/src/types';
import { command } from 'execa';
import enquirer from 'enquirer';

export class HygenWrapper {
  private readonly config: RunnerConfig;

  constructor(config?: RunnerConfig) {
    this.config = {
      cwd: process.cwd(),
      logger: new Logger(console.log.bind(console)),
      debug: !!process.env.DEBUG,
      exec: (action, body) => {
        const opts = body && body.length > 0 ? { input: body } : {};
        return command(action, { ...opts, shell: true });
      },
      createPrompter: <Q, T>() => enquirer as unknown as Prompter<Q, T>,
      ...(config || {}),
    };
  }

  public async run(argv: string[]): Promise<ActionResult[]> {
    return engine(argv, await resolve(this.config));
  }
}
