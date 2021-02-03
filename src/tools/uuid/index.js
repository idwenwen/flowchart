import { isFunction } from 'lodash'

// 唯一标识符
export default class UUID {
  // format: formatUUID; 格式化唯一标识的方法
  // index: number;
  // next: nextIndex; 表示当前的
  constructor (format, start = 1, next) {
    this.format = format
    this.index = start
    // 下标间隔函数
    this.next = isFunction(next)
      ? next
      : (index) => {
        return index + 1
      }
  }

  // 获取新的UUID内容
  get () {
    const result = this.format ? this.format(this.index) : this.index.toString()
    this.index = this.next(this.index)
    return result
  }
}
