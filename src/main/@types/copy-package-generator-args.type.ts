import { CookArgs } from './cook-args.type';
import { NpmPackage } from './npm-package.type';

export type CopyPackageGeneratorArgs = {
  npmPackage: Pick<NpmPackage, 'name'>;
  generator: string;
  sourceTemplateDir: string;
  targetTemplateDir: string;
} & Pick<CookArgs, 'shouldOverwriteTemplates'>;
