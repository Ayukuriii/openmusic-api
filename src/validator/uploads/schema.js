const Joi = require('joi')

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid(
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/webp'
    )
    .required(),
}).unknown()

const ImageSizeSchema = Joi.number().max(512000)

module.exports = { ImageHeadersSchema, ImageSizeSchema }
