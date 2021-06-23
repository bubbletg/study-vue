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

