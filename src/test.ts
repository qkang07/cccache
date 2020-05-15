
import { IConfig } from '.';
const dayjs = require('dayjs')
const makeExpire = (config: IConfig) => {
    if (config.expire[0] === 'in') {
        let expiredIn = config.expire[1]
        if (/[0-9]+(Y|M|D|h|m|s|t)/.test(expiredIn)) {
            let type = expiredIn.substr(expiredIn.length - 1)
            let num = Number(expiredIn.substr(0, expiredIn.length - 1))
            // console.log(type, num)
            let expire = new Date()
            switch (type) {
                case 'Y': expire.setFullYear(expire.getFullYear() + num); break;
                case 'M': expire.setMonth(expire.getMonth() + num); break;
                case 'D': expire.setDate(expire.getDate() + num); break;
                case 'h': expire.setHours(expire.getHours() + num); break;
                case 'm': expire.setMinutes(expire.getMinutes() + num); break;
                case 's': expire.setSeconds(expire.getSeconds() + num); break;
                case 't': expire.setMilliseconds(expire.getMilliseconds() + num); break;
                default: expire = null;
            }
            if (expire) {
                return expire.getTime()
            } else {
                return 0
            }
        } else {
            console.log('expired time format illegal',config.expire)
        }
    } else if (config.expire[0] === 'at') {
        let at = config.expire[1]
        let now = dayjs()
        const subValuesList = ['month', 'date', 'hour', 'minute', 'second', 'millisecond']

        const parser = (format, lastUnit, prefix = '') => {
            let currentStr = now.format(format)
            let atValue:any = at
            // console.log(format, unit,prefix , currentStr, at)
            
            let unitIndex = subValuesList.indexOf(lastUnit)
            if (prefix) {
                // 前缀标识的类型
                
                let currentUnit = subValuesList[unitIndex + 1]
                atValue = Number(at.replace(prefix, ''))
                console.log(currentUnit, atValue, currentStr, at)

                if (lastUnit === 'week') {
                    // d：day of week 是个特殊情况
                    unitIndex = subValuesList.indexOf('month')
                    currentUnit = 'day'
                }

                // 判断当前周期是否已经超过该时间点
                if (Number(currentStr) > atValue) {
                    now = now.add(1, lastUnit)
                }
                // 设置所需要的时间
                now = now.set(currentUnit, atValue)
            } else { 
                // HH:mm:ss 之类的格式化类型
                if (currentStr > at) {
                    now = now.add(1, lastUnit)
                }
            }
            for (let i = unitIndex + 2; i < subValuesList.length; i++){
                if (subValuesList[i] === 'date') {
                    now = now.set(subValuesList[i], 1)
                } else {
                    now = now.set(subValuesList[i], 0)
                }
            }
        }
        // const setSubValues = (start) => {
        //     let flag = false
        //     subValuesList.forEach(unit => {
        //         if (start === unit) {
        //             flag = true
        //         }
        //         if (flag) {
        //             if (unit === 'date') {
        //                 now.set(unit, 1)
        //             } else {
        //                 now.set(unit, 0)
        //             }
        //         }
        //     })
        // }
        if (/\d{2}:\d{2}:\d{2}/.test(at)) {
                
            // HH:mm:ss
            parser('HH:mm:ss', 'day')
            let arr = at.split(':').map(v => Number(v))
            now = now.hour(arr[0]).minute(arr[1]).second(arr[2])
            // setSubValues('millisecond')
        } else if (/\d{2}:\d{2}/.test(at)) {
            // HH:mm
            parser('HH:mm', 'day')
            let arr = at.split(':').map(v => Number(v))
            now = now.hour(arr[0]).minute(arr[1])
            // setSubValues('second')
        } else if (/\d{1,2}-\d{1,2}/.test(at)) {
            // MM-DD  a date for each year... will this be useful?
            parser('M-D', 'year')
            let arr = at.split('-').map(v => Number(v))
            now = now.month(arr[0] - 1).date(arr[1])
            // setSubValues('hour')
        } else if (/M\d{1,2}/.test(at)) {
            // month of a year, exp: m2
            parser('M', 'year', 'M')
            // setSubValues('date')
        } else if (/D\d/.test(at)) {
            // date of a monty
            parser('D', 'month', 'D')
            // setSubValues('date')
        } else if (/d\d/.test(at)) {
            // day of a week, exp: w2, start from 0/Sunday
            parser('d', 'week', 'd')
            // setSubValues('hour')
        } else if (/h\d+/.test(at)) {
            // hours
            parser('H', 'date', 'h')
            // setSubValues('minute')
        } else if (/m\d+/.test(at)) {
            // minutes
            parser('m', 'hour', 'm')
            // setSubValues('second')
        } else if (/s\d+/.test(at)) {
            // seconds
            parser('s', 'minute', 's')
            // setSubValues('millisecond')
        } else {
            console.log('expired time format illegal',config.expire)

        }
        return now.valueOf()
    } else {
        return 0
    }
}


let config: IConfig = {}


function test(c: IConfig) {
    let time = makeExpire(c)
    console.log(dayjs(time).format('YYYY-MM-DD HH:mm:ss'),c.expire)
}

config.expire = ['in','2Y']
test(config)
config.expire = ['in','3D']
test(config)
config.expire = ['at','08:00:00']
test(config)
config.expire = ['at','04:00']
test(config)
config.expire = ['at','6-15']
test(config)
config.expire = ['at','08:00:00']
test(config)
config.expire = ['at','M3']
test(config)
config.expire = ['at','D3']
test(config)
config.expire = ['at','d5']
test(config)
config.expire = ['at','h14']
test(config)
config.expire = ['at','m23']
test(config)
config.expire = ['at','s23']
test(config)
