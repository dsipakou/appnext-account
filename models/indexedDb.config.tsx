
interface UserState {
  id: number
  email: string
  username: string
  currency: string
  token: string
}

class AccountDB {
  private static instance: AccountDB

  private constructor() { }

  public static getInstance(): AccountDB {
    if (!AccountDB.instance) {
      AccountDB.instance = new AccountDB()
    }
  }
}

let db;

function createDB() {
  const request = window.indexedDB.open('AccountDB', 1)

  request.onsuccess = (e) => {
    db = request.result
  }

  request.onerror = (e) => {
    console.log(`IndexedDB error: ${request.errorCode}`)
  }

  request.onupgradeneeded = (e) => {
    db = request.result
    const objectStore = db.createObjectStore('users', { keyPath: 'id' })

    objectStore.createIndex('id', 'id', { unique: true })
    objectStore.createIndex('email', 'email', { unique: true })
    objectStore.createIndex('currency', 'currency', { unique: false })
    objectStore.createIndex('username', 'username', { unique: false })
    objectStore.createIndex('token', 'token', { unique: true })
  }
}

export function addUser(user: UserState) {
  createDB()
  emptyStore()

  const transaction = db.transaction('users', 'readwrite')
  const objectStore = transaction.objectStore('users')
  const request = objectStore.add(user)

  request.onerror = (err) => {
    console.error(`Cannot add user: ${err}`)
  }
}

export function getUser() {
  createDB()

  const request = db.transaction('users').objectStore('users').getAll()

  request.onsuccess = (event) => {
    const data = request.result
  }
}

export function emptyStore() {
  createDB()

  const request = db.transaction('users', 'readwrite').objectStore('users').clear()
}
