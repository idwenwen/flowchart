const ORIGIN = 'origin'
export function acquistion (context, CustomHandler) {
  const HandlerExtension = {
    set (target, key, value) {
      // 表示当前对象Key值之中有origin内容，则直接操作原对象上的内容。
      if (key.toString().search(ORIGIN + '.') >= 0) {
        return (target[key.toString().replace(ORIGIN + '.', '')] = value)
      } else {
        return CustomHandler.set && CustomHandler.set(target, key, value)
      }
    },

    get (target, key) {
      // 如果是ORIGIN相同，表示当前对象
      if (key.toString() === ORIGIN) {
        return target
      } else if (key.toString().search(ORIGIN + '.') >= 0) {
        return target[key.toString().replace(ORIGIN + '.', '')]
      } else {
        return CustomHandler.get && CustomHandler.get(target, key)
      }
    }
  }

  // 返回相关代理内容
  return new Proxy(context, Object.assign({}, CustomHandler, HandlerExtension))
}
