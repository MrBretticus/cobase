class ExtendableError extends Error {
  constructor(message) {
    super(message)
    this.stack = (new Error()).stack
    this.name = this.constructor.name
  }
}

class AccessError extends ExtendableError {
  get status() {
    return 403
  }
  get isExternal() {
    return true
  }
}
export {
  AccessError
}