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

## 组件化

### createComponent

构造子类构造函数，安装组件钩子函数和实例化 `vnode`。`createComponent` 后返回的是组件 `vnode`，它也一样走到 `vm._update` 方法，进而执行了 `patch` 函数。

#### 构造子类构造函数

`Vue.extend` 的作用就是构造一个 `Vue` 的子类，它使用一种非常经典的原型继承的方式把一个纯对象转换一个继承于 `Vue` 的构造器 `Sub` 并返回，然后对 `Sub` 这个对象本身扩展了一些属性，如扩展 `options`、添加全局 API 等；并且对配置中的 `props` 和 `computed` 做了初始化工作；最后对于这个 `Sub` 构造函数做了缓存，避免多次执行 `Vue.extend` 的时候对同一个子组件重复构造。

#### 安装组件钩子函数

整个 `installComponentHooks` 的过程就是把 `componentVNodeHooks` 的钩子函数合并到 `data.hook` 中，在 VNode 执行 `patch` 的过程中执行相关的钩子函数。

这里要注意的是合并策略，在合并过程中，如果某个时机的钩子已经存在 `data.hook` 中，那么通过执行 `mergeHook` 函数做合并，这个逻辑很简单，就是在最终执行的时候，依次执行这两个钩子函数即可。

#### 实例化 VNode

通过 `new VNode` 实例化一个 `vnode` 并返回。需要注意的是和普通元素节点的 `vnode` 不同，组件的 `vnode` 是没有 `children` 的。

### 组件 patch 过程

patch 的过程会调用 `createElm` 创建元素节点，createElm 中会 createComponent。`createComponent` 函数中，首先对 `vnode.data` 做了一些判断，如果 `vnode` 是一个组件 VNode，那么条件会满足，并且得到 `i` 就是 `init` 钩子函数。`init` 钩子函数它是通过 `createComponentInstanceForVnode` 创建一个 Vue 的实例，然后调用 `$mount` 方法挂载子组件，这里 `$mount` 相当于执行 `child.$mount(undefined, false)`，它最终会调用 `mountComponent` 方法，进而执行 `vm._render()` 方法，执行完 `vm._render` 生成 VNode 后，接下来就要执行 `vm._update` 去渲染 VNode 了。在 `_update_`最后就是调用 `__patch__` 渲染 VNode 。在完成组件的整个 `patch` 过程后，最后执行 `insert(parentElm, vnode.elm, refElm)` 完成组件的 DOM 插入，如果组件 `patch` 过程中又创建了子组件，那么DOM 的插入顺序是先子后父。

### 合并配置

通过调用 `mergeOptions` 方法来合并，它实际上就是把 `resolveConstructorOptions(vm.constructor)` 的返回值和 `options` 做合并，`resolveConstructorOptions` 的实现先不考虑，在我们这个场景下，它还是简单返回 `vm.constructor.options`，相当于 `Vue.options`。

`mergeOptions` 主要功能就是把 `parent` 和 `child` 这两个对象根据一些合并策略，合并成一个新对象并返回。比较核心的几步，先递归把 `extends` 和 `mixins` 合并到 `parent` 上，然后遍历 `parent`，调用 `mergeField`，然后再遍历 `child`，如果 `key` 不在 `parent` 的自身属性上，则调用 `mergeField`。

Vue 初始化阶段对于 `options` 的合并过程，对于 `options` 的合并有 2 种方式，子组件初始化过程通过 `initInternalComponent` 方式要比外部初始化 Vue 通过 `mergeOptions` 的过程要快，合并完的结果保留在 `vm.$options` 中。
