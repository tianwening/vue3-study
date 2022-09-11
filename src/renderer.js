// 渲染器
// vnode = {
//   tag: 'div',
//   props: {
//     name: '张三',
//     onClick: function () {}
//   },
//   children: [
//     {
//       tag: 'span',
//       children: 'hello world'
//     }
//   ]
// }
export function renderer(vnode, container) {
  const el = document.createElement(vnode.tag)

  // 处理props
  for(const key in vnode.props) {
    if(/^on/.test(key)) {
      el.addEventListener(key.substring(2).toLowerCase(), vnode.props[key])
    }else {
      el.setAttribute(key, vnode.props[key])
    }
  }

  if(typeof vnode.children === 'string') {
    el.appendChild(document.createTextNode(vnode.children))
  }else if(Array.isArray(vnode.children)) {
    vnode.children.forEach(v => {
      renderer(v, el)
    })
  }

  container.appendChild(el)

}