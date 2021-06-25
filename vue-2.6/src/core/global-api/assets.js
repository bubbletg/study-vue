/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          // 组件名校验
          validateComponentName(id)
        }
        // 判断 definition 是否为普通对象
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          // 把 definition  转换为构造器
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        // 把构造器赋值给 options 属性
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
