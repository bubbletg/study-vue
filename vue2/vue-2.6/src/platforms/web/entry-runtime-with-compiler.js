/* @flow */

/**
 * 在 web 应用下，这里是入口文件
 */
import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 获得原型上的$mount 方法,缓存起来
const mount = Vue.prototype.$mount
// 重新定义 $mount
Vue.prototype.$mount = function ( // 切片 ，函数劫持 
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 得到 el 
  el = el && query(el)

  /* istanbul ignore if */
  //  el 不能是 body,html,即 vue 不能直接挂载到 html 和 body  上
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  // 拿到 options ，用户传递的所有参数
  const options = this.$options
  // resolve template/el and convert to render function
  // 判断是否定义 render 方法
  if (!options.render) {
    let template = options.template
    // 判断是否 写 template 
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') { // 判断 template 是否以# 开头    // new Vue({ template: "#xxxx"})
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML // 获取模版内容
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 没有定义 template  时候 
      // 通过 OuterHTML 得到 
      // 就是 html 标签中 <div id ="app"></div> 的 子内容
      template = getOuterHTML(el)
    }

    // template 的查找顺序 先找 render函数 -> template -> html 中 template
    // 拿到 template 后，下面进行编译相关
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      // 把模版变成 render 函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)

      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }

  // 执行mount 方法 ，这的 mount 是 const mount = Vue.prototype.$mount 得到的
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
