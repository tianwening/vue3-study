let data = new Proxy({
  name: '张三'
}, {
  get() {
    console.log('get')
  },
  set() {
    console.log('set')
  }
})

data.name = '12'