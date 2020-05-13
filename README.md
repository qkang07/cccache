# CCCache

多级缓存模块

利用内存、LocalStorage、IndexedDB 实现的多级缓存

所有数据最终都会离线存储于IndexedDB

由于IndexedDB异步且性能不佳，仅作为离线存储仓库，且不保证实时性

对实时性要求较高的数据请使用localStorage层级的缓存，例如首页加载所需的数据
