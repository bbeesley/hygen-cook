import { Instruction } from './instruction.type';

export type Recipe = {
  name: string;
  ingredients?: string[];
  instructions: Instruction[];
};
