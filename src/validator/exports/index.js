const ExportPlaylistsPayloadSchema = require('./schema')
const InvariantError = require('../../exception/InvariantError')

const ExportsValidator = {
  validateExportPlaylistsPayload: (payload) => {
    const validationResult = ExportPlaylistsPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

module.exports = ExportsValidator
