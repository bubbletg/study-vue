# study-vue

学习参考地址：https://ustbhuangyi.github.io/vue-analysis/v2/prepare/

注：该文大部分内容来自：https://ustbhuangyi.github.io/vue-analysis/v2/prepare/

本文只作为一个学习笔记记录过程。

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

### createElement

createElement方法实际上是对createElement方法的封装，它允许传入的参数更加灵活，在处理这些参数后，调用真正创建 VNode 的函数createElement.

`createElement` 函数的流程略微有点多，我们接下来主要分析 2 个重点的流程 —— `children` 的规范化以及 VNode 的创建。

#### children 的规范化

`simpleNormalizeChildren` 方法调用场景是 `render` 函数是编译生成的。理论上编译生成的 `children` 都已经是 VNode 类型的，但这里有一个例外，就是 `functional component` 函数式组件返回的是一个数组而不是一个根节点，所以会通过 `Array.prototype.concat` 方法把整个 `children` 数组打平，让它的深度只有一层。

`normalizeChildren` 方法的调用场景有 2 种，一个场景是 `render` 函数是用户手写的，当 `children` 只有一个节点的时候，Vue.js 从接口层面允许用户把 `children` 写成基础类型用来创建单个简单的文本节点，这种情况会调用 `createTextVNode` 创建一个文本节点的 VNode；另一个场景是当编译 `slot`、`v-for` 的时候会产生嵌套数组的情况，会调用 `normalizeArrayChildren` 方法。

#### VNode 的创建

先对 `tag` 做判断，如果是 `string` 类型，则接着判断如果是内置的一些节点，则直接创建一个普通 VNode，如果是为已注册的组件名，则通过 `createComponent` 创建一个组件类型的 VNode，否则创建一个未知的标签的 VNode。 如果是 `tag` 一个 `Component` 类型，则直接调用 `createComponent` 创建一个组件类型的 VNode 节点。



