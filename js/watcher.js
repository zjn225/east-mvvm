// 订阅者Watcher在初始化的时候需要将自己添加进订阅器Dep中
/**
 * 
 * @param {} vm 
 * @param {vm.data里的key} exp 
 * @param {更新的回调函数} cb 
 */
function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    this.value = this.get();  // 将自己添加到订阅器的实现方法
}

Watcher.prototype = {
    update: function() {
        this.run();
    },
    run: function() {
        var value = this.vm.data[this.exp];
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    get: function() {
        Dep.target = this;  // 缓存自己（因为只需要在订阅者Watcher初始化的时候才需要添加订阅者）
        var value = this.vm[this.exp]  // 通过获取值的方式，强制执行Observer里的get函数，来将自己添加到订阅器里
        Dep.target = null;  // 释放自己
        return value;
    }
};
