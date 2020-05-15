import { IStoreDriver, IStoreUnit, IConfig } from ".";
import { genNow } from './helper';

const ExpiredSymbol = Symbol('expired')
class CCLocalStorage implements IStoreDriver {
    set(key, unit: IStoreUnit) {
        key = 'cccache-'+key
        let str = JSON.stringify(unit)
        localStorage.setItem(key, str)
    }
    get(key): IStoreUnit {
        key = 'cccache-'+key
        let v = localStorage.getItem(key)
        if (v) {
            return JSON.parse(v)
        }
        return null
    }
    flash(key): IStoreUnit {
        key = 'cccache-'+key
        let v = this.get(key)
        this.del(key)
        return v
    }
    del(key) {
        key = 'cccache-'+key
        localStorage.removeItem(key)
    }
}
export const ldb = new CCLocalStorage()