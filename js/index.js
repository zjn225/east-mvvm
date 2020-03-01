function MVVM (options) {
    var self = this;
    this.data = options.data;
    this.methods = options.methods;

    // data:{title:"" name: ""}
    Object.keys(this.data).forEach(function(key) {
        self.proxyKeys(key); 
    });

    observe(this.data);
    new Compile(options.el, this);
    options.mounted.call(this); // 所有事情处理好后执行mounted函数
}

MVVM.prototype = {
    // 属性代理，MVVM.data.name ==> MVVM.name，即自动加个data
    proxyKeys: function (key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function getter () {
                return self.data[key];
            },
            set: function setter (newVal) {
                self.data[key] = newVal;
            }
        });
    }
}
