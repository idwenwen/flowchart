class PanelOperation {
  setAttr (attrs) {
    this.panel.attrs.set(attrs)
  }

  removeAttr (attrs) {
    this.panel.attrs.remove(attrs)
  }

  setStyle (style) {
    this.panel.style.set(style)
  }

  removeStyle (styles) {
    this.panel.style.remove(styles)
  }

  rotate (angle) {
    this.panel.transfrom.rotate(angle)
  }

  translate (x, y) {
    this.panel.transfrom.translate(x, y)
  }

  scale (times) {
    this.panel.transfrom.scale(times)
  }

  setPosition (point) {
    this.setStyle({
      top: point[1] + 'px',
      left: point[0] + 'px'
    })
  }

  setWidth (width) {
    this.panel.setAttr({
      width
    })
  }

  setHeight (height) {
    this.panel.setAttr({
      height
    })
  }

  getPos () {
    return [
      parseFloat(this.panel.style.get('left')),
      parseFloat(this.panel.style.get('top'))
    ]
  }

  getWidth () {
    return this.panel.attrs.get('width')
  }

  getHeight () {
    return this.panel.attrs.get('height')
  }

  updated ({position, width, height}) {
    position && this.setPosition(position)
    width && this.setWidth(width)
    height && this.setHeight(height)
  }
}

export default PanelOperation
