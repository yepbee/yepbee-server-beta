/* eslint-disable @typescript-eslint/no-unused-vars */

export type StateModuleOptions = {
  test: string;
};

type Enum = string;

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
  // private stack: ServiceInfo<S>[] = [];
  // get currentService(): S {
  //   if (this.stack.length === 0) return this.rootService;
  //   return this.stack[this.stack.length - 1].name;
  // }
  // get serviceStack(): readonly ServiceInfo<S>[] {
  //   return this.stack;
  // }
  constructor(
    readonly serviceAdjacencyList: ServiceAdjacencyList<S>,
    readonly services: Services<S>,
    readonly rootService: S,
  ) {}
  async beforeAll(currentService: S, ...args: unknown[]): Promise<void> {
    return;
  }
  async afterAll(currentService: S, ...args: unknown[]): Promise<void> {
    return;
  }
  async beforeEach(currentService: S, ...args: unknown[]): Promise<void> {
    return;
  }
  async afterEach(currentService: S, ...args: unknown[]): Promise<void> {
    return;
  }
  // async backBeforeEach(...args: unknown[]): Promise<void> {
  //   return;
  // }
  // async backAfterEach(...args: unknown[]): Promise<void> {
  //   return;
  // }
  // clearStack(): boolean {
  //   this.stack = [];
  //   return true;
  // }
  isRoot(root: S): boolean {
    return this.rootService === root;
  }
  canDo(currentService: S, nextService: S): boolean {
    return this.serviceAdjacencyList[currentService].includes(nextService);
  }
  // async prev(...args: unknown[]): Promise<boolean> {
  //   if (this.stack.length === 0) return false;
  //   try {
  //     await this.backBeforeEach(...args);
  //     await this.stack.pop().undo(...args);
  //     await this.backAfterEach(...args);
  //   } catch (e) {
  //     console.error('* Failed to back run', e);
  //     return false;
  //   }
  //   return true;
  // }
  async next(
    currentService: S,
    nextService: S,
    ...args: unknown[]
  ): Promise<boolean> {
    if (this.canDo(currentService, nextService) === false) return false;

    if (this.isRoot(currentService))
      await this.beforeAll(currentService, ...args); // -----
    if (this.isRoot(nextService)) {
      await this.afterEach(nextService, ...args);
      await this.afterAll(nextService, ...args); // -----
      return true; // this.clearStack(); // true
    }

    try {
      await this.beforeEach(currentService, ...args);
      const backtrack = await this.services[nextService](...args);
      // this.stack.push({ name: service, undo: backtrack });
    } catch (e) {
      // await this.backRun(...args);
      return false;
    }
    try {
      await this.afterEach(nextService, ...args);
    } catch (e) {
      // await this.backRun(...args);
      return false;
    }
    return true;
  }
  // async backRun(...args: unknown[]): Promise<boolean> {
  //   while (this.stack.length) {
  //     if ((await this.prev(...args)) === false) return false;
  //   }
  //   return true;
  // }
  async run(services: S[], ...args: unknown[]): Promise<boolean> {
    let currentService: S = this.rootService;
    for (const nextService of services) {
      if ((await this.next(currentService, nextService, ...args)) === false)
        return false;
      currentService = nextService;
    }
    return true;
  }
}
