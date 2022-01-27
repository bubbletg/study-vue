/* @flow */

import {
  warn,
  once,
  isDef,
  isUndef,
  isTrue,
  isObject,
  hasSymbol,
  isPromise
} from 'core/util/index'

import { createEmptyVNode } from 'core/vdom/vnode'

function ensureCtor (comp: any, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

export function createAsyncPlaceholder (
  factory: Function,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag: ?string
): VNode {
  const node = createEmptyVNode()
  node.asyncFactory = factory
  node.asyncMeta = { data, context, children, tag }
  return node
}

/**
 * 异步组件
 * @param {*} factory 
 * @param {*} baseCtor 
 * @param {*} context 
 * @returns 
 */
export function resolveAsyncComponent (
  factory: Function,
  baseCtor: Class<Component>,
  context: Component
): Class<Component> | void {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (isDef(factory.contexts)) {
    // already pending
    factory.contexts.push(context)
  } else {
    // vue 实例
    const contexts = factory.contexts = [context]
    let sync = true

    /**
     * 执行所有的 vm 实例的 $forceUpdate 方法
     * @param {*} renderCompleted 
     */
    const forceRender = (renderCompleted: boolean) => {
      for (let i = 0, l = contexts.length; i < l; i++) {
        contexts[i].$forceUpdate()
      }

      if (renderCompleted) {
        contexts.length = 0
      }
    }
    // resolve， 执行工厂函数传入的
    const resolve = once((res: Object | Class<Component>) => {
      // cache resolved
      // 返回一个异步组件饿构造器，保存在 factory.resolved 
      factory.resolved = ensureCtor(res, baseCtor)
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        // 遍历所有 context，执行 forceUpdate
        forceRender(true)
      }
    })
    // reject，执行工厂函数传入的， once 方法 只执行一次
    const reject = once(reason => {
      process.env.NODE_ENV !== 'production' && warn(
        `Failed to resolve async component: ${String(factory)}` +
        (reason ? `\nReason: ${reason}` : '')
      )
      if (isDef(factory.errorComp)) {
        factory.error = true
        forceRender(true)
      }
    })
    // 加载异步组件
    const res = factory(resolve, reject)

    if (isObject(res)) {
      /**
       * 异步组件，使用 promise 方式时候
       */
      //  Vue.component("HelloWorld",()=>import('./components/HelloWorld.vue'));
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject)
        }

      } else 
       /**
        * 高级异步组件
        * @returns 
        */
      //  const AsyncComp = ()=>({
      //   component:import('./components/HelloWorld.vue'),
      //   loading:LoadingComp,
      //   error:ErrorComp,
      //   delay:200,
      //   timeout:1000
      // })
      // Vue.component("HelloWorld",AsyncComp);
      if (isPromise(res.component)) {
        res.component.then(resolve, reject)

        if (isDef(res.error)) {
          // 转换为构造器
          factory.errorComp = ensureCtor(res.error, baseCtor)
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor)
          if (res.delay === 0) {
            // 直接 渲染 loadingComp
            factory.loading = true
          } else {
            setTimeout(() => {
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true
                forceRender(false)
              }
            }, res.delay || 200)
          }
        }

        if (isDef(res.timeout)) {
          setTimeout(() => {
            if (isUndef(factory.resolved)) {
              reject(
                process.env.NODE_ENV !== 'production'
                  ? `timeout (${res.timeout}ms)`
                  : null
              )
            }
          }, res.timeout)
        }
      }
    }

    sync = false
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}
