const InvariantError = require('../../exception/InvariantError')
const { SongPayloadSchema } = require('./schema')

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  // validateQuery: (query) => {
  //   const validationResult = SongPayloadSchema.validate(query)

  //   if (validationResult.error) {
  //     throw new Error(validationResult.error.message)
  //   }
  //   return validationResult
  // },
}

module.exports = SongsValidator
