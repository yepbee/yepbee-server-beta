export type StateModuleOptions = {
  test: string;
};

export type Enum = string;

export type ServiceEnum<T extends Enum> = Record<T, T>;
export type ServiceAdjacencyList<T extends Enum> = Record<T, T[]>;

export type Undo = () => void;
export type Do = () => Undo;

export type Services<T extends Enum> = Record<T, Do>;

export type ServiceInfo<T extends Enum> = {
  name: T;
  undo: Undo;
};

export abstract class AtomicService<S extends Enum> {
  private serviceStack: ServiceInfo<S>[] = [];
  get currentService(): S {
    if (this.serviceStack.length === 0) return this.root;
    return this.serviceStack[this.serviceStack.length - 1].name;
  }
  get stack(): readonly ServiceInfo<S>[] {
    return this.serviceStack;
  }
  constructor(
    readonly serviceAdjacencyList: ServiceAdjacencyList<S>,
    readonly services: Services<S>,
    readonly root: S,
  ) {}
  abstract beforeAll<T>(...args: T[]): void;
  abstract afterAll<T>(...args: T[]): void;
  abstract beforeEach<T>(...args: T[]): void;
  abstract afterEach<T>(...args: T[]): void;
  abstract backBeforeEach<T>(...args: T[]): void;
  abstract backAfterEach<T>(...args: T[]): void;
  clearStack(): boolean {
    this.serviceStack = [];
    return true;
  }
  isRoot(root: S): boolean {
    return this.root === root;
  }
  canDo(service: S): boolean {
    return this.serviceAdjacencyList[this.currentService].includes(service);
  }
  prev<T>(...args: T[]): boolean {
    if (this.serviceStack.length === 0) return false;
    try {
      this.backBeforeEach(...args);
      this.serviceStack.pop().undo();
      this.backAfterEach(...args);
    } catch (e) {
      console.error('* Failed to back run', e);
      return false;
    }
    return true;
  }
  next<T>(service: S, ...args: T[]): boolean {
    if (this.canDo(service) === false) return false;

    if (this.isRoot(this.currentService)) this.beforeAll(); // -----
    if (this.isRoot(service)) {
      this.afterAll(...args); // -----
      return this.clearStack(); // true
    }

    try {
      this.beforeEach(...args);
      const backtrack = this.services[service]();
      this.serviceStack.push({ name: service, undo: backtrack });
    } catch (e) {
      this.backRun(...args);
      return false;
    }
    try {
      this.afterEach(...args);
    } catch (e) {
      this.backRun(...args);
      return false;
    }
    return true;
  }
  backRun<T>(...args: T[]): boolean {
    while (this.stack.length) {
      if (this.prev(...args) === false) return false;
    }
    return true;
  }
  run<T>(services: S[], ...args: T[]): boolean {
    for (const service of services) {
      if (this.next(service, ...args) === false) return false;
    }
    return true;
  }
}
