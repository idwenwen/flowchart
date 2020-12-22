class PanelOperation {
  setAttr (attrs) {
    this.panelManager.attrs.set(attrs)
  }

  removeAttr (attrs) {
    this.panelManager.attrs.remove(attrs)
  }

  setStyle (style) {
    this.panelManager.style.set(style)
  }

  removeStyle (styles) {
    this.panelManager.style.remove(styles)
  }

  rotate (angle) {
    this.panelManager.transfrom.rotate(angle)
  }

  translate (x, y) {
    this.panelManager.transfrom.translate(x, y)
  }

  scale (times) {
    this.panelManager.transfrom.scale(times)
  }

  setPosition (point) {
    this.setStyle({
      top: point[1] + 'px',
      left: point[0] + 'px'
    })
  }

  setWidth (width) {
    this.panelManager.setAttr({
      width
    })
  }

  setHeight (height) {
    this.panelManager.setAttr({
      height
    })
  }

  getPos () {
    return [
      parseFloat(this.panelManager.style.get('left')),
      parseFloat(this.panelManager.style.get('top'))
    ]
  }

  getWidth () {
    return this.panelManager.attrs.get('width')
  }

  getHeight () {
    return this.panelManager.attrs.get('height')
  }

  updated ({position, width, height}) {
    position && this.setPosition(position)
    width && this.setWidth(width)
    height && this.setHeight(height)
  }
}

export default PanelOperation
