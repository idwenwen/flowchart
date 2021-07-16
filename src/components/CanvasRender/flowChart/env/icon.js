export default class Icons {
  constructor (setting) {
    setting = {
      complete: require('../icon/complete.svg'),
      disableComplete: require('../icon/disable_complete.svg'),
      error: require('../icon/error.svg'),
      disableError: require('../icon/disable_error.svg'),
      multData: require('../icon/mult_data.svg'),
      multModel: require('../icon/mult_model.svg'),
      contentLock: require('../icon/content_lock.svg')
    }
    this.icons = new Map()
    if (setting) {
      this.loadImages(setting)
    }
  }

  loadImage (key, url) {
    const img = new Image()
    img.src = url
    this.icons.set(key, img)
  }

  loadImages (setting) {
    for (const key in setting) {
      this.loadImage(key, setting[key])
    }
  }

  getIcon (key) {
    return this.icons.get(key)
  }

  release () {
    this.icons.clear()
  }
}
