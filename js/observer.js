// 实例化构造函数的工厂函数
function observe(data, vm) {
    if (!data || typeof data !== 'object') {
        return;
    }
    return new Observer(data);
};

// 构造函数
function Observer(data) {
    this.data = data;
    this.walk(data); // 实例化的时候执行数据劫持
}

// 遍历所有属性值，并对其进行Object.defineProperty()处理
Observer.prototype = {
    walk: function (data) {
        var self = this;
        Object.keys(data).forEach(function (key) {
            self.defineReactive(data, key, data[key]);
        });
    },
    defineReactive: function (data, key, val) {
        var dep = new Dep();
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function getter() {
                // 判断是否需要添加订阅者
                // Dep.target这个值，逻辑看watcher.js文件，实例化Watcher的时候就有值了，开始执行加入sub的逻辑
                if (Dep.target) {
                    dep.addSub(Dep.target);  // Watcher初始化的时候往加进Dep    
                }
                return val;
            },
            set: function setter(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                dep.notify();
            }
        });
    }
};

// 收集订阅者，属性变化的时候执行对应订阅者的更新函数
function Dep() {
    this.subs = [];
}
Dep.prototype = {
    addSub: function (sub) {
        this.subs.push(sub);
    },
    notify: function () {
        this.subs.forEach(function (sub) {
            sub.update();
        });
    }
};
Dep.target = null;
