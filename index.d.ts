
export default cccache.CCCache


declare namespace cccache {
    class CCCache {
        constructor()
        setConfig(config)
        set(key: string, value: any, config?: CCCacheConfig):void
        get(key: string, level?: StoreLevel): any
        del(key: string, level?: StoreLevel): void
        
    }
    export type StoreLevel = 'mem'|'local'
    export type CCCacheConfig = {
        level?: StoreLevel
        expire?: ['at'|'in', string]
    }

    
}