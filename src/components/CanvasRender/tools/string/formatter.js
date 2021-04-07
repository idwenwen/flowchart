const equals = {
  'date' () {
    return new Date().toString()
  },
  'length' (origin) {
    return origin.length
  }
}

// 字符串规格化类型
export function strFormat (origin, eq = equals) {
  const willExchange = /<[\s|\d|\w]+>/g
  let final = origin
  const list = origin.match(willExchange)
  const rest = origin.replace(willExchange, '')
  if (list.length > 0) {
    list.forEach(val => {
      const key = val.replace(/[<|>]/g, '')
      final = final.replace(val, eq[key](rest))
    })
  }
  return final
}

export function toCamel (origin) {
  const willChange = origin.match(/_\d/g)
  let final = origin
  willChange.forEach(val => {
    final = final.replace(val, val.replace('_', '').toUpperCase())
  })
  return final
}
