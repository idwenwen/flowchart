import { toArray, each } from '../iteration'
import { isObject, trim, remove, eq, isArray } from 'lodash'

// 创建新的dom元素内容
export function create (name) {
  return document.createElement(name)
}

// 父级元素添加自己元素内容。
export function append (parent, children) {
  parent.append(...toArray(children))
}

// 为dom元素添加事件
export function addEvents (dom, events) {
  each(events)((val, key) => {
    dom.addEventListener(key, (eve) => {
      each(toArray(val))(item => {
        item(eve)
      })
    })
  })
}

// 为dom设置属性。
export function setAttr (dom, nameOrMult, value) {
  if (isObject(nameOrMult)) {
    each(nameOrMult)((attr, key) => {
      if (key.toString().toLowerCase() === 'style') {
        setStyle(dom, attr)
      } else if (key.toString().toLowerCase() === 'class') {
        setClass(dom, attr)
      } else {
        dom.setAttribute(key, attr)
      }
    })
  } else {
    dom.setAttribute(nameOrMult, value)
  }
}

// 为dom元素移除属性
export function removeAttr (dom, name) {
  if (Array.isArray(name)) {
    each(name)((val) => {
      dom.removeAttribute(val)
    })
  } else {
    dom.removeAttribute(name)
  }
}

// 获取Style属性内容
export function getStyle (dom) {
  let origin = dom.getAttribute('style')
  if (origin) origin = origin.split(';')
  if (isArray(origin) && origin[origin.length - 1]) origin.pop() // 去除掉最后的空字符串
  const result = {}
  if (origin) {
    each(origin)((val) => {
      const item = val.split(':')
      if (item.length === 2) {
        result[trim(item[0])] = trim(item[1])
      }
    })
  }
  return result
}

// 为dom元素设置style属性
export function setStyle (dom, keyOrMult, value) {
  const origin = getStyle(dom)
  if (isObject(keyOrMult)) {
    each(keyOrMult)((val, key) => {
      origin[key] = val
    })
  } else {
    origin[keyOrMult] = value
  }
  let finalStyle = ''
  each(origin)((val, key) => {
    finalStyle += `${key}:${val};`
  })
  dom.setAttribute('style', finalStyle)
}

// 为dom元素移除style
export function removeStyle (dom, key) {
  const origin = this.getStyle(dom)
  key = toArray(key)
  each(key)((val) => {
    return delete origin[val]
  })
  this.setStyle(dom, origin)
}

// 为dom内容设置class属性。
export function setClass (dom, cla) {
  const origin = this.getClass(dom)
  cla = toArray(cla)
  each(cla)((val) => {
    const index = origin.findIndex((item) => item === val)
    if (index >= 0) {
      const attr = origin.splice(index, 1)
      origin.push(attr[0])
    } else {
      origin.push(val)
    }
  })
  dom.setAttribute('class', origin.join(' '))
}

// 移除class内容。
export function removeClass (dom, cla) {
  const origin = this.getClass(dom)
  cla = toArray(cla)
  remove(origin, (val) => cla.find((item) => eq(item, val)), true)
  dom.setAttribute('class', origin.join(' '))
}

/**
 * 设置dom变形。当前trans之中只有如下参数
 * 1. translateX x轴变动
 * 2. translateY y轴变动
 * 3. rotateX X轴旋转
 * 4. rotateY Y轴旋转
 * 5. scaleX X轴缩放
 * 6. scaleY Y轴缩放
 */
export function transform (dom, trans) {
  function splicing (str, ...checked) {
    return each(str)((val, index) => {
      if (val.search('scale') >= 0) {
        if (checked[index] !== 1) {
          return val + '(' + checked[index] + ')'
        }
      } else {
        if (checked[index] !== 0) {
          return val + '(' + checked[index] + ')'
        }
      }
    }).join(' ')
  }
  setStyle(dom, {
    'translate': splicing`translateX(${trans.translateX}) translateY(${trans.translateY}) rotateX(${trans.rotateX}) rotateY(${trans.rotateY}) scaleX(${trans.scaleX}) scaleY(${trans.scaleY})`,
    '-webkit-transform': splicing`translateX(${trans.translateX}) translateY(${trans.translateY}) rotateX(${trans.rotateX}) rotateY(${trans.rotateY}) scaleX(${trans.scaleX}) scaleY(${trans.scaleY})`,
    '-moz-transform': splicing`translateX(${trans.translateX}) translateY(${trans.translateY}) rotateX(${trans.rotateX}) rotateY(${trans.rotateY}) scaleX(${trans.scaleX}) scaleY(${trans.scaleY})`,
    '-ms-transform': splicing`translateX(${trans.translateX}) translateY(${trans.translateY}) rotateX(${trans.rotateX}) rotateY(${trans.rotateY}) scaleX(${trans.scaleX}) scaleY(${trans.scaleY})`
  })
}
