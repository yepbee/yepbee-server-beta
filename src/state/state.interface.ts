/* eslint-disable @typescript-eslint/no-unused-vars */

export type StateModuleOptions = {
  test: string;
};

export type Enum = string;

export type ServiceEnum<T extends Enum> = Record<T, T>;
export type ServiceAdjacencyList<T extends Enum> = Record<T, unknown[]>;

export type Undo = (...args: unknown[]) => Promise<void>;
export type Do = (...args: unknown[]) => Promise<Undo>;

export type Services<T extends Enum> = Record<T, Do>;

export type ServiceInfo<T extends Enum> = {
  name: T;
  undo: Undo;
};

export abstract class AtomicService<S extends Enum> {
  private stack: ServiceInfo<S>[] = [];
  get currentService(): S {
    if (this.stack.length === 0) return this.rootService;
    return this.stack[this.stack.length - 1].name;
  }
  get serviceStack(): readonly ServiceInfo<S>[] {
    return this.stack;
  }
  constructor(
    readonly serviceAdjacencyList: ServiceAdjacencyList<S>,
    readonly services: Services<S>,
    readonly rootService: S,
  ) {}
  async beforeAll(...args: unknown[]): Promise<void> {
    return;
  }
  async afterAll(...args: unknown[]): Promise<void> {
    return;
  }
  async beforeEach(...args: unknown[]): Promise<void> {
    return;
  }
  async afterEach(...args: unknown[]): Promise<void> {
    return;
  }
  async backBeforeEach(...args: unknown[]): Promise<void> {
    return;
  }
  async backAfterEach(...args: unknown[]): Promise<void> {
    return;
  }
  clearStack(): boolean {
    this.stack = [];
    return true;
  }
  isRoot(root: S): boolean {
    return this.rootService === root;
  }
  canDo(service: S): boolean {
    return this.serviceAdjacencyList[this.currentService].includes(service);
  }
  async prev(...args: unknown[]): Promise<boolean> {
    if (this.stack.length === 0) return false;
    try {
      await this.backBeforeEach(...args);
      await this.stack.pop().undo(...args);
      await this.backAfterEach(...args);
    } catch (e) {
      console.error('* Failed to back run', e);
      return false;
    }
    return true;
  }
  async next(service: S, ...args: unknown[]): Promise<boolean> {
    if (this.canDo(service) === false) return false;

    if (this.isRoot(this.currentService)) await this.beforeAll(...args); // -----
    if (this.isRoot(service)) {
      await this.afterAll(...args); // -----
      return this.clearStack(); // true
    }

    try {
      await this.beforeEach(...args);
      const backtrack = await this.services[service](...args);
      this.stack.push({ name: service, undo: backtrack });
    } catch (e) {
      await this.backRun(...args);
      return false;
    }
    try {
      await this.afterEach(...args);
    } catch (e) {
      await this.backRun(...args);
      return false;
    }
    return true;
  }
  async backRun(...args: unknown[]): Promise<boolean> {
    while (this.stack.length) {
      if ((await this.prev(...args)) === false) return false;
    }
    return true;
  }
  async run(services: S[], ...args: unknown[]): Promise<boolean> {
    for (const service of services) {
      if ((await this.next(service, ...args)) === false) return false;
    }
    return true;
  }
}
