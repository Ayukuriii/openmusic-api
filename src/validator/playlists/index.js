const InvariantError = require('../../exception/InvariantError')
const { PlaylistPayloadSchema } = require('./playlistSchema')
const { PlaylistSongPayloadSchema } = require('./PlaylistSongSchema')

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSongPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

module.exports = PlaylistValidator
