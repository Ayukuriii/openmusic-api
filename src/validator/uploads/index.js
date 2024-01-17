const InvariantError = require('../../exception/InvariantError')
const { ImageHeadersSchema, ImageSizeSchema } = require('./schema')

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateImageSize: (length) => {
    const validationResult = ImageSizeSchema.validate(length)

    if (validationResult.error) {
      const error = new InvariantError(validationResult.error.message)
      error.statusCode = 413

      throw error
    }
  },
}

module.exports = UploadsValidator
