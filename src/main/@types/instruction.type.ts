import { Arg } from './arg.type';

export type Instruction = {
  ingredient: string;
  generator: string;
  action: string;
  basePath?: string;
  args: Arg[];
};
