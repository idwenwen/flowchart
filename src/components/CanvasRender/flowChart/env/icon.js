export default class Icons {
  constructor (setting) {
    this.icons = new Map()
  }

  loadImage (key, url) {
    const _t = this
    const img = new Image()
    img.onload = function () {
      _t.icons.set(key, img)
    }
    img.src = url
  }

  loadImages (setting) {
    for (const key in setting) {
      this.loadImage(key, setting[key])
    }
  }

  getIcon (key) {
    return this.icons.get(key)
  }
}
