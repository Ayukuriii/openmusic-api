const autoBind = require('auto-bind')
const PlaylistsService = require('../../services/postgres/PlaylistsService')

class ExportsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator
    this._owner = new PlaylistsService()

    autoBind(this)
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { id: playlistId } = request.params

    // check ownership
    await this._owner.verifyPlaylistOwner(playlistId, credentialId)

    const message = {
      userId: credentialId,
      targetEmail: request.payload.targetEmail,
    }

    await this._service.sendMessage('export:playlists', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sendang kami proses',
    })

    response.code(201)

    return response
  }
}

module.exports = ExportsHandler
