import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export interface AppWorld extends World {
  context: Record<string, unknown>;
}

class CustomWorld extends World implements AppWorld {
  context: Record<string, unknown> = {};

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
