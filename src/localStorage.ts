import { IStoreDriver } from ".";
import { genNow } from '@/helper';
import pako from 'pako'

const ExpiredSymbol = Symbol('expired')
class CCLocalStorage implements IStoreDriver {
    private valProcess(v: string) {
        let splitIndex = v.lastIndexOf('|')
        let subfix = v.substr(splitIndex)
        if (subfix && /\d[12]/.test(subfix)) {
            let expire = Number(subfix)
            let now = genNow()
            if (expire < now) {
                return ExpiredSymbol
            } else {
                v = v.substring(0,splitIndex)
            }
        } 
        try {
            let obj = JSON.parse(v)
            return obj
        } catch (e) {
            return v
        }
    }
    set(key, value) {
        let str
        if (typeof value === 'string') {
            str = value
        } else {
            str = JSON.stringify(value)
        }
        localStorage.setItem(key, str)
    }
    get(key) {
        let v = localStorage.getItem(key)
        if (v) {
            let ret = this.valProcess(v)
            if (ret === ExpiredSymbol) {
                this.del(key)
                return undefined
            }
        }
        return v
    }
    flash(key) {
        let v = this.get(key)
        this.del(key)
        return v
    }
    del(key) {
        localStorage.removeItem(key)
    }
    checkAll() {
        
    }
}