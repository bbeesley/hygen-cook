export type AddOptions = {
  name?: string;
  prefix?: string;
};

export type Arg = {
  option: string;
  value?: string;
};

export type Instruction = {
  package: string;
  generator: string;
  args: Arg[];
};
export type Recipe = {
  name: string;
  ingredients?: string[];
  instructions: Instruction[];
};
