// 展示tooltip的内容。
export default class Tooltip {
  constructor (container, text) {
    this.text = text
    this.container = container
    this.figure = null
    this.panel = null
  }

  getParameter () {
    const _t = this
    return {
      center () {
        return [
          this.attrs.width / 2,
          this.attrs.height / 2
        ]
      },
      text () {
        return _t.text
      }
    }
  }

  getEvents () {
    const _t = this
    return {
      textChange (newText) {
        this.text = newText
        _t.text = newText
      }
    }
  }

  toRender () {

  }
}
