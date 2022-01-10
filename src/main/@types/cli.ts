export enum CliPackageManager {
  npm = 'npm',
  yarn = 'yarn',
}

export type CliArgs = {
  recipe: string;
  packageManager: CliPackageManager;
};
