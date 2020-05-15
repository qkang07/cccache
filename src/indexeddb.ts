import { IStoreUnit } from '.';




class CCIndexedDB {
    db: any
    status:'open'|'not' = 'not'
    open() {
        return new Promise((res, rej) => {
            let req = window.indexedDB.open('cccache')
            req.onsuccess = (ev) => {
                this.db = req.result
                this.status = 'open'
                res()
            }
            req.onerror = ev => {
                rej()
            }
            req.onblocked = ev => {
                rej()
            }
            req.onupgradeneeded = ev => {
                this.db = (ev.target as any).result
                this.status = 'open'
                debugger
                if (!this.db.objectStoreNames.contains('d')) {
                    let store = this.db.createObjectStore('d', {
                        keyPath: 'key',
                        
                    })
                }
            }
        })

    }
    private trans(process:(store:any)=>any,mode = 'readwrite') {
        return new Promise((res, rej) => {
            if (this.status !== 'open') {
                return
            }
            let trans = this.db.transaction(['d'],mode)
            let store = trans.objectStore('d')
            let req = process(store)
            req.onerror = () => {
                rej()
            }
            req.onsuccess = ev => {
                res(ev.result)
            }
        })
    }
    set(key, value:IStoreUnit) {
        return this.trans(store => {
            return store.put({
                key,value
            })
        })
    }

    get(key):Promise<IStoreUnit> {
        return this.trans(store => {
            return store.get(key)
        },'readonly')
    }
    del(key) {
        return this.trans(store=>store.delete(key))
    }

    all() {
        return new Promise<IStoreUnit[]>((res, rej) => {
            if (this.status !== 'open') {
                return
            }
            let trans = this.db.transaction(['d'], 'readonly')
            let store = trans.objectStore('d')
            let result = []
            store.openCursor().onsuccess = ev => {
                let cursor = ev.target.result
                if (cursor) {
                    result.push(cursor.value)
                    cursor.continue()
                } else {
                    res(result)
                }
            }
        })
    }

}

export const idb = new CCIndexedDB()