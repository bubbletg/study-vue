# study-vue

学习参考地址：https://ustbhuangyi.github.io/vue-analysis/v2/prepare/

## vue 的目录结构

> ```text
> src
> ├── compiler        # 编译相关 
> ├── core            # 核心代码 
> ├── platforms       # 不同平台的支持
> ├── server          # 服务端渲染
> ├── sfc             # .vue 文件解析
> ├── shared          # 共享代码
> ```

## 数据驱动

### new Vue 发生了什么？

在 new Vue过程中，调用 Vue 构造函数，然后进行初始化工作，初始化 化生命周期、事件、render、初始化状态,包含 props、methods、data、computed、watch，并对其属性对比，不能重复，还对 da ta 实现 响应式等等工作。

### Vue 实例挂载的实现

在 compiler 版本下，先缓存了原型上的 `$mount` 方法，再重新定义该方法，然后对 `el` 做了限制，Vue 不能挂载在 `body`、`html` 这样的根节点上。然后判断是否定义 `render` 方法，没有定义，则会把 `el` 或者 `template` 字符串转换成 `render` 方法。最后，调用原先原型上的 `$mount` 方法挂载。

`$mount` 方法实际上会去调用 `mountComponent` 方法，`mountComponent` 核心就是先实例化一个渲染`Watcher`，在它的回调函数中会调用 `updateComponent` 方法，在此方法中调用 `vm._render` 方法先生成虚拟 Node，最终调用 `vm._update` 更新 DOM。

### render

`vm._render` 最终是通过执行 `createElement` 方法并返回的是 `vnode`，它是一个虚拟 Node。

