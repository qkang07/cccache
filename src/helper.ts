import { IConfig } from '.';
import day from 'dayjs'
export const promise = (res, rej) => {
    
}

export const genNow = () => {
    let now = new Date()
    let v = now.getFullYear()
    v = v * 100 + (now.getMonth() + 1)
    v = v * 100 + now.getDate()
    v = v * 100 + now.getHours()
    v = v * 100 + now.getMinutes()
    return v
}

export const makeExpire = (config: IConfig) => {
    if (config.expiredIn) {
        let expiredIn = config.expiredIn
        if (/[0-9]+(Y|M|D|h|m|s|t)/.test(expiredIn)) {
            let type = expiredIn.substr(expiredIn.length - 2)
            let num = Number(expiredIn.substr(0, expiredIn.length - 2))
            let expire = new Date()
            switch (type) {
                case 'Y': expire.setFullYear(expire.getFullYear() + num); break;
                case 'M': expire.setMonth(expire.getMonth() + num);break;
                case 'D': expire.setDate(expire.getDate() + num);break;
                case 'h': expire.setHours(expire.getHours() + num);break;
                case 'm': expire.setMinutes(expire.getMinutes() + num);break;
                case 's': expire.setSeconds(expire.getSeconds() + num);break;
                case 't': expire.setMilliseconds(expire.getMilliseconds() + num); break;
                default: expire = null;
            }
            if (expire) {
                return expire.getTime()
            } else {
                return 0
            }
        } else {
            throw 'expired time format illegal'
        }
    } else if (config.expiredAt) {
        let at = config.expiredAt
        let now = day()
        
        if (typeof at === 'string') {
            const parser = (format, unit, prefix = '') => {
                if (prefix + now.format(format) > at) {
                    now = now.add(1, unit)
                }
            }
            if (/\d{2}:\d{2}:\d{2}/.test(at)) { 
                // HH:mm:ss
                parser('HH:mm:ss', 'day')
                let arr = at.split(':').map(v => Number(v))
                now.set('hour', arr[0])
                now.set('minute', arr[1])
                now.set('second', arr[2])

            } else if (/\d{2}:\d{2}/.test(at)) {
                // HH:mm
                parser('HH:mm', 'day')
                let arr = at.split(':').map(v => Number(v))
                now.set('hour', arr[0])
                now.set('minute', arr[1])
            } else if (/\d{1,2}-\d{1,2}/.test(at)) {
                // MM-DD  a date for each year... will this be useful?
                parser('MM-DD', 'year')
                let arr = at.split('-').map(v => Number(v))
                now.set('month', arr[0])
                now.set('date', arr[1])
            } else if (/M\d{1,2}/.test(at)) {
                // month of a year, exp: m2
                parser('M', 'year', 'M')
            } else if (/D\d/) {
                // date of a monty
                parser('D', 'month', 'D')
            } else if (/d\d/) {
                // day of a week, exp: w2, start from 0/Sunday
                parser('d', 'day', 'd')
            } else if (/h\d+/.test(at)) {
                // hours
                parser('H', 'date', 'H')
            } else if (/m\d+/.test(at)) {
                // minutes
                parser('m', 'H', 'm')
            } else if (/s\d+/.test(at)) {
                // seconds
                parser('s', 'm', 's')
            } else {
                throw 'expired time format illegal'
            }
            return now.millisecond()
        } else if (typeof at === 'number') {
            return at
        } else if (at instanceof Date) {
            return at.getTime()
        }
    }
}

export const checkExpired = (expire: number) => {
    
}

/**
 * 深拷贝
 * @param {*} obj 拷贝对象(object or array)
 * @param {*} cache 缓存数组
 */
export function deepCopy (obj, cache = []) {
    // typeof [] => 'object'
    // typeof {} => 'object'
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    // 如果传入的对象与缓存的相等, 则递归结束, 这样防止循环
    /**
     * 类似下面这种
     * var a = {b:1}
     * a.c = a
     * 资料: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
     */
    const hit = cache.filter(c => c.original === obj)[0]
    if (hit) {
      return hit.copy
    }
  
    const copy = Array.isArray(obj) ?  [] :   {}
    // 将copy首先放入cache, 因为我们需要在递归deepCopy的时候引用它
    cache.push({
      original: obj,
      copy
    })
    Object.keys(obj).forEach(key => {
      copy[key] = deepCopy(obj[key], cache)
    })
  
    return copy
  }