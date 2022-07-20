export let activeEffect;

export function effect(fn) {
  // effect方法接收一个函数参数，会将其保存，并执行一次；以后还会扩展出更多的功能，所以先实现一个 ReactiveEffect 类
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

class ReactiveEffect {
    constructor(fn) {
        this.fn = fn
       
    }
    
    run() {
        activeEffect = this
        this.fn()
    }
}

const targetMap = new WeakMap

/**
 * 实现依赖收集的方法。关联 响应式对象的属性 和 effect。
 */
export function track(target, key) {
  if(activeEffect) {
    let depsMap = targetMap.get(target)
    if(!depsMap) {
      targetMap.set(target, depsMap = new Map)
    }

    let deps = depsMap.get(key)
    if(!deps) {
      depsMap.set(key, deps = new Set)
    }
    
     // 如果 effect 已经存在了，则不再收集
     let shouldTrack = !deps.has(activeEffect)
     if(shouldTrack) {
       deps.add(activeEffect)
     }
  }
}

export function trigger(target, key) {
  // 找到target的所有依赖
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    return // 属性没有依赖任何的 effect
  }

  // 属性依赖的 effect 列表
  let effects = depsMap.get(key)
  if(effects) {
    // 属性的值发生变化，找到它依赖的 effect 列表，让所有的effect依次执行
    effects.forEach(effect => {
      effect.run()
    })
 }
}
