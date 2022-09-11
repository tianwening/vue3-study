// weakMap -> target -> key -> Map -> value -> Set

let activeEffect = null
let targetMap = new WeakMap()
let obj = new Proxy({
  ok: true,
  name: '张三',
  age: 25
}, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    trigger(target, key)
  }
})

function track(target, key) {
  if (!activeEffect) {
    return
  }
  let depMap = targetMap.get(target)
  if (!depMap) {
    targetMap.set(target, (depMap = new Map()))
  }
  let deps = depMap.get(key)
  if (!deps) {
    depMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depMap = targetMap.get(target)
  if (!depMap) {
    return
  }
  const effects = depMap.get(key)

  const effectToRun = new Set()

  effects && effects.forEach(effect => {
    if(effect !== activeEffect) {
      effectToRun.add(effect)
    }
  })

  effectToRun && effectToRun.forEach(effect => effect())
}

// cleanup需要重新设计下effect的实现
let effectStack = []
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
  }
  // 给收集的依赖函数添加一个deps选项
  effectFn.deps = []
  effectFn()
}


function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}


effect(() => {
  obj.age++
})

// let o1, o2
// 嵌套的effect
// effect(() => {
//   console.log('active1 run')
//   effect(() => {
//     console.log('effect2 run')
//     o2 = obj.age
//   })
//   console.log('active1 end')
//   o1 = obj.name
// })

// obj.name = '李四'

// 切换分支
// effect(() => {
//   let a = obj.ok ? obj.name : 'hello world'
// })


// setTimeout(() => {
//   obj.ok = false
// }, 500)


// setTimeout(() => {
//   obj.name = '李四'
// })

// effect(() => {
//   console.log(obj.name)
// })

// effect(() => {
//   console.log('age', obj.age)
// })


// setTimeout(() => {
//   obj.age = '李四'
// }, 500)