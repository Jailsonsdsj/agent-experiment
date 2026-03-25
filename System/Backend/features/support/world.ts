import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export interface AppWorld extends World {
  requestBody: Record<string, unknown>;
  responseStatus: number;
  responseBody: unknown;
}

class CustomWorld extends World implements AppWorld {
  requestBody: Record<string, unknown> = {};
  responseStatus = 0;
  responseBody: unknown = null;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);
