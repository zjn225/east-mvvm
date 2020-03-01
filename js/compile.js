function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);  // "#app"
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    init: function () {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el); // 将根节点通过遍历firstChild的方式加入fragment中
            this.compile(this.fragment); // 核心！对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    },
    nodeToFragment: function (el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild; // <h2>{{title}}</h2>
        // 将Dom元素移入fragment中
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    compile: function (el) {
        var childNodes = el.childNodes;
        var self = this;
        // 遍历子节点集合
        [].slice.call(childNodes).forEach(function (node) {
            var reg = /\{\{(.*)\}\}/; // 匹配 {{}}
            var text = node.textContent;
            // 根据nodeType是否为1,是否元素节点
            if (self.isElementNode(node)) {
                self.compileElement(node);
                // nodeType是否为3，是否文本节点，如<h2>{{title}}</h2>，这个是属于文本节点，通过node.textContent渲染值
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, reg.exec(text)[1]); 
            }
            // 递归
            if (node.childNodes && node.childNodes.length) {
                self.compile(node);
            }
        });
    },
    // 处理元素节点，如input、button
    compileElement: function (node) {
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, function (attr) {
            var attrName = attr.name;
            if (self.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) {  // 事件指令，截取on:click后面的click，通过node.addEventListener注册事件，不用新建Watcher
                    self.compileEvent(node, self.vm, exp, dir);
                } else {  // v-model 指令，通过node.value渲染值，通过node.addEventListener注册input事件实时改变值，新建Watcher
                    self.compileModel(node, self.vm, exp, dir);
                }
                node.removeAttribute(attrName);
            }
        });
    },
    compileText: function (node, exp) {
        var self = this;
        var initText = this.vm[exp];
        this.updateText(node, initText); // 页面初次渲染
        new Watcher(this.vm, exp, function (value) {
            self.updateText(node, value); // Observer监听数据变化时更新所用的回调
        });
    },
    compileEvent: function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    compileModel: function (node, vm, exp, dir) {
        var self = this;
        var val = this.vm[exp];
        this.modelUpdater(node, val);
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function (e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },
    updateText: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    modelUpdater: function (node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
    isDirective: function (attr) {
        return attr.indexOf('v-') == 0;
    },
    isEventDirective: function (dir) {
        return dir.indexOf('on:') === 0;
    },
    isElementNode: function (node) {
        return node.nodeType == 1;
    },
    isTextNode: function (node) {
        return node.nodeType == 3;
    }
}
