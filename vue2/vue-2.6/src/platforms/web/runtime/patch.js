/* @flow */

import * as nodeOps from 'web/runtime/node-ops'   // dom 操作的方法
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index' // 维护一些基础属性
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
/**
 * baseModules: [ ref, directives ]
 * platformModules: [attrs,klass,events,domProps,style,transition ] 以及其他 属性
 */
const modules = platformModules.concat(baseModules)

/**
 * 通过 执行 createPatchFunction 方法，返回 patch 方法
 * {
 *  nodeOps: 里面放的是一些 dom 操作方法。
 *  modules: [ ref, directives,attrs,klass,events,domProps,style,transition ] 以及其他属性
 * }
 */
export const patch: Function = createPatchFunction({ nodeOps, modules })
