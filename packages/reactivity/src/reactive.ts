import { isObject } from '@my-vue/shared'

// 缓存响应式对象
const reactiveMap = new WeakMap

const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
} 


export function reactive (target) {
   
  // 只能代理对象
  if(!isObject(target)) {
    return target
  }
  
  // 判断 target 是否是响应式对象
  if(target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  // 判断 target 是否被代理过。如果被代理过，则直接返回代理对象
  const existing = reactiveMap.get(target)
  if(existing) {
    return existing
  }
  
  const handler = {
    // 监听属性访问操作
    get(target, key, receiver) {
      // 访问到 __v_isReactive 属性时，说明此时的 target 其实是一个 proxy 对象，无需再被代理
      if(key === ReactiveFlags.IS_REACTIVE) {
        return true
      }
      console.log(`${key}属性被访问，依赖收集`)

      const res = Reflect.get(target, key)
      if(isObject(res)) {
        return reactive(res)
      }
      return res
    },
    
    // 监听设置属性操作
    set(target, key, value, receiver) {
      console.log(`${key}属性变化了，派发更新`)
     
      // 当属性的新值和旧值不同时，再进行设置
      if(target[key] !== value) {
         const result = Reflect.set(target, key, value, receiver);
         return result
      }
    }
  }
  
  // 实例化代理对象
  const proxy = new Proxy(target, handler)

  // 将代理对象进行缓存
  reactiveMap.set(target, proxy)

  return proxy
}