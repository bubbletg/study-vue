import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

/**
 *  Vue 构造函数
 *  Vue 使用构造函数，而不使用类，这样可以把一些扩展分散到多个模块中去实现，
 *  而不是在一个模块里实现所有，这种方式是用 Class 难以实现的。
 * @param {*} options 
 */
function Vue (options) {
  //开发环境，不是 new 调用 来实例，抛出警告
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 初始化 ，在 src/core/instance/init.js 中定义
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
