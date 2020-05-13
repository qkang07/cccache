import pako from 'pako'
import { ccidb } from '@/indexeddb';
import { makeExpire, deepCopy } from '@/helper';
type StoreLevel = 'mem'|'local'|'db'
export type IConfig  = {
    level:StoreLevel
    expiredAt: string|Date|number
    expiredIn: string
}

interface StoreUnit {
    key?: any
    value?: any
    expire?: number
    level?: StoreLevel
}

export interface IStoreDriver {
    set(key, value):void
    get(key): any
    del(key): void
    checkAll(): void
}


export default class CCCache {
    private config: IConfig
    
    private memCache: Map<any, StoreUnit> = new Map()
    
    private lsRegs: Map<any, StoreUnit> = new Map()
    private idbRegs: Map<any, StoreUnit> = new Map()
    constructor() {
        
        ccidb.open().then(res => {
            this.loadIndexedDB()
        })
    }

    loadIndexedDB() {
        let now = Date.now()
        let expired = []
        ccidb.all().then(res => {
            res.forEach(item=>{
                if (item.expire < now) {
                    expired.push(item.key)
                } else {
                    this.idbRegs.set(item.key, { expire: item.expire })
                    this.memCache.set(item.key, {
                        ...item,
                    })
                }
            })
        })
    }
    loadLocalStorage() {
        let expired = []
        let now = Date.now()
        for (let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i)
            if (key.indexOf('cccache') >= 0) {
                let item = localStorage.getItem(key)
                let obj:StoreUnit = JSON.parse(item)
                if (obj.expire < now) {
                    expired.push(key)
                } else {
                    this.memCache.set(obj.key, obj)
                    this.lsRegs.set(obj.key, {expire:obj.expire})
                }
            }
        }
        expired.forEach(key => {
            localStorage.removeItem(key)
        })
    }

    setConfig(config: IConfig) {
        
    }
    set(key, value, config?: IConfig) {
        let unit: StoreUnit = {
            value: deepCopy(value)
        }
        if (config) {
            unit.expire = makeExpire(config)
            unit.level = config.level || 'mem'
        }
        this.memCache.set(key, unit)
        ccidb.set(key, unit)
    }
    get(key,level?:StoreLevel) {
        let item = this.memCache.get(key)
        if (item && item.level) {
            return item
        }
    }
    del(key, level:StoreLevel) {
        
    }
    clear() {
        
    }
}
