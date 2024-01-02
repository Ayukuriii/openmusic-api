const Joi = require('joi')

const AlbumPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
})

module.exports = { AlbumPayloadSchema }
