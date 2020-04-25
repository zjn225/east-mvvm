function MVVM(options) {
    var self = this;
    this.data = options.data;
    this.methods = options.methods;

    // data:{title:"" name: ""}
    Object.keys(this.data).forEach(function (key) {
        // 属性代理，MVVM.data.name ==> MVVM.name，即自动加个data
        self.proxyKeys(key);
    });

    // 数据观测
    observe(this.data);  
    // 解析器Compile，对每个元素节点的指令（比如v-on、v-model、v-if、模板语法{{}}等）进行解析，页面初始化的时候根据指令模板替换数据，
    // 以及绑定相应的更新函数，（比如{{title}}，初始化的时候先把title的默认值替换掉，然后绑定回调，这个回调就是每次update的时候执行的函数）
    new Compile(options.el, this);
    options.mounted.call(this); // 所有事情处理好后执行mounted函数
}

MVVM.prototype = {
    proxyKeys: function (key) {
        var self = this;
        // 这个劫持只是做个属性代理而已，不是响应式核心
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function getter() {
                return self.data[key];
            },
            set: function setter(newVal) {
                self.data[key] = newVal;
            }
        });
    }
}
