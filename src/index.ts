import { idb } from './indexeddb';
import { makeExpire, deepCopy, zip, unzip, checkExpired } from './helper';
import { ldb } from './localStorage';
type StoreLevel = 'mem'|'local'
export type IConfig  = {
    level?:StoreLevel
    // expiredAt?: string|Date|number
    // expiredIn?: string
    // expireEvery?: string
    expire?:['at'|'in', string]
    zip?:boolean
}


export interface IStoreUnit {
    key?: any
    value?: any
    expire?: number
    level?: StoreLevel
    zip?: boolean
    createdAt?:number
}

export interface IStoreDriver {
    set(key, value):void
    get(key): any
    del(key): void
}


export default class CCCache {
    private config: IConfig
    private initTime: number
    private memCache: Map<any, IStoreUnit> = new Map()
    
    constructor() {
        this.initTime = Date.now()
        idb.open().then(res => {
            // 因为开启比较慢，对于首次加载时存入的值写入
            this.loadIndexedDB()
        })
    }
    
    loadIndexedDB() {
        let expired = []
        idb.all().then(res => {
            res.forEach(item => {
                
                if (checkExpired(item.expire)) {
                    expired.push(item.key)
                } else {
                    console.log(item, deepCopy(item))
                    this.memCache.set(item.key, deepCopy(item.value))
                }
            })
            expired.forEach(key => {
                idb.del(key)
            })
        })
    }
    loadLocalStorage() {
        let expired = []
        let now = Date.now()
        for (let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i)
            if (key.indexOf('cccache-') === 0) {

                let item = ldb.get(key.replace('cccache-', ''))
                if(checkExpired(item.expire)){
                    expired.push(key)
                } else {
                    this.memCache.set(item.key, item)
                }
            }
        }
        expired.forEach(key => {
            localStorage.removeItem(key)
        })
    }

    setConfig(config: IConfig) {
        this.config = config
    }
    set(key, value, config?: IConfig) {
        let unit: IStoreUnit = {
            value: deepCopy(value)
        }
        config = Object.assign({},config, this.config)
        unit.expire = makeExpire(config)
        console.log(unit.expire, Date.now())
        unit.level = config.level || 'mem'
        unit.zip = config.zip || false
        unit.createdAt = Date.now()
        if (unit.zip) {
            unit.value = zip(unit.value)
        }
        this.memCache.set(key, unit)
        if (unit.level === 'local') {
            ldb.set(key, unit)
        }
        idb.set(key, unit)
    }
    get(key, level?: StoreLevel) {
        
        let item = this.memCache.get(key)
        if (!item || level && item.level !== level) {
            item = ldb.get(key)
        } 
        if (item) {
            
            if (checkExpired(item.expire)) {
                console.log('expired')
                this.del(key)
            } else if (item.zip) {
                return unzip(item.value)
            } else {
                return item.value
            }
        }
        return undefined
    }
    del(key, level?:StoreLevel) {
        this.memCache.delete(key)
        if (!level || level === 'local') {
            ldb.del(key)
        } 
        idb.del(key)
    }
}
