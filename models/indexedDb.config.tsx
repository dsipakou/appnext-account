export function promisifyRequest<T = undefined>(
  request: IDBRequest<T> | IDBTransaction,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // @ts-ignore - file size hacks
    request.oncomplete = request.onsuccess = () => resolve(request.result);
    // @ts-ignore - file size hacks
    request.onabort = request.onerror = () => reject(request.error);
  });
}

export function createStore(dbName: string, storeName: string): UseStore {
  const request = indexedDB.open(dbName);
  request.onupgradeneeded = () => {
    const objectStore = request.result.createObjectStore(storeName);

    objectStore.createIndex('id', 'id', { unique: true })
    objectStore.createIndex('email', 'email', { unique: true })
    objectStore.createIndex('currency', 'currency', { unique: false })
    objectStore.createIndex('username', 'username', { unique: false })
    objectStore.createIndex('token', 'token', { unique: true })
  }
  const dbp = promisifyRequest(request);

  return (txMode, callback) =>
    dbp.then((db) =>
      callback(db.transaction(storeName, txMode).objectStore(storeName)),
    );
}

let defaultGetStoreFunc: UseStore | undefined;

function defaultGetStore() {
  if (!defaultGetStoreFunc) {
    defaultGetStoreFunc = createStore('AccountDB', 'users');
  }
  return defaultGetStoreFunc;
}

export function entries<KeyType extends IDBValidKey, ValueType = any>(
  customStore = defaultGetStore(),
): Promise<[KeyType, ValueType][]> {
  return customStore('readonly', (store) => {
    // Fast path for modern browsers
    // (although, hopefully we'll get a simpler path some day)
    if (store.getAll && store.getAllKeys) {
      return Promise.all([
        promisifyRequest(
          store.getAllKeys() as unknown as IDBRequest<KeyType[]>,
        ),
        promisifyRequest(store.getAll() as IDBRequest<ValueType[]>),
      ]).then(([keys, values]) => keys.map((key, i) => [key, values[i]]));
    }

    const items: [KeyType, ValueType][] = [];

    return customStore('readonly', (store) =>
      eachCursor(store, (cursor) =>
        items.push([cursor.key as KeyType, cursor.value]),
      ).then(() => items),
    );
  });
}

export function get<T = any>(
  key: IDBValidKey,
  customStore = defaultGetStore(),
): Promise<T | undefined> {
  return customStore('readonly', (store) => promisifyRequest(store.get(key)));
}

export function set(
  key: IDBValidKey,
  value: any,
  customStore = defaultGetStore(),
): Promise<void> {
  return customStore('readwrite', (store) => {
    store.put(value, key);
    return promisifyRequest(store.transaction);
  });
}

export function clear(customStore = defaultGetStore()): Promise<void> {
  return customStore('readwrite', (store) => {
    store.clear();
    return promisifyRequest(store.transaction);
  });
}
