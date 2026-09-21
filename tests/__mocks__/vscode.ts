export enum ConfigurationTarget {
  Global = 1,
  Workspace = 2,
  WorkspaceFolder = 3,
}

export enum StatusBarAlignment {
  Left = 1,
  Right = 2,
}

export class ThemeColor {
  constructor(public id: string) {}
}

const mockConfigStore = new Map<string, any>();

export const workspace = {
  getConfiguration: (section?: string) => ({
    get: <T>(key: string, defaultValue?: T): T => {
      const fullKey = section ? `${section}.${key}` : key;
      return mockConfigStore.has(fullKey) ? mockConfigStore.get(fullKey) : (defaultValue as T);
    },
    update: jest.fn((key: string, value: any, _target?: any) => {
      const fullKey = section ? `${section}.${key}` : key;
      mockConfigStore.set(fullKey, value);
      return Promise.resolve();
    }),
  }),
};

export const window = {
  showInformationMessage: jest.fn((_message: string, ..._items: any[]) => Promise.resolve()),
  showWarningMessage: jest.fn((_message: string, ..._items: any[]) => Promise.resolve()),
  showErrorMessage: jest.fn((_message: string, ..._items: any[]) => Promise.resolve()),
  createStatusBarItem: jest.fn((_alignment?: StatusBarAlignment, _priority?: number) => ({
    text: '',
    tooltip: '',
    command: '',
    color: undefined as any,
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
  })),
};

export interface Memento {
  keys(): readonly string[];
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: any): Thenable<void>;
}

export class MockMemento implements Memento {
  private store = new Map<string, any>();

  keys(): readonly string[] {
    return Array.from(this.store.keys());
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.store.has(key) ? this.store.get(key) : (defaultValue as T);
  }

  update(key: string, value: any): Thenable<void> {
    if (value === undefined) {
      this.store.delete(key);
    } else {
      this.store.set(key, value);
    }
    return Promise.resolve();
  }

  clear() {
    this.store.clear();
  }
}
