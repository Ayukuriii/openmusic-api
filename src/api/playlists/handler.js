const autoBind = require('auto-bind')
const ClientError = require('../../exception/ClientError')

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload)
    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials

    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    })

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    })

    response.code(201)

    return response
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._service.getPlaylists(credentialId)

    return {
      status: 'success',
      data: {
        playlists,
      },
    }
  }

  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._service.verifyPlaylistOwner(id, credentialId)
      await this._service.deletePlaylistById(id)

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })

        response.code(error.statusCode)

        return response
      }

      // server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      })

      response.code(500)

      console.log(error)

      return response
    }
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload)
      const { id: credentialId } = request.auth.credentials
      const { id: playlistId } = request.params
      const { songId } = request.payload

      await this._service.verifyPlaylistAccess(playlistId, credentialId)
      await this._service.addPlaylistSongById({ playlistId, songId })

      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan ke playlist',
      })

      response.code(201)

      return response
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })

        response.code(error.statusCode)

        return response
      }

      // server error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      })

      response.code(500)

      console.error(error)

      return response
    }
  }

  async getPlaylistSongHandler(request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(id, credentialId)

    const playlist = await this._service.getPlaylistById(id, credentialId)
    const playlistSongs = await this._service.getPlaylistSongs(id)

    const transformedPlaylist = {
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
      songs: playlistSongs.map((song) => ({
        id: `song-${song.id}`,
        title: song.title,
        performer: song.performer,
      })),
    }

    return {
      status: 'success',
      data: {
        playlist: transformedPlaylist,
      },
    }
  }

  async deletePlaylistSongHandler(request) {
    this._validator.validatePlaylistSongPayload(request.payload)
    const { id } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(id, credentialId)
    await this._service.deletePlaylistSongById(id, songId)

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    }
  }
}

module.exports = PlaylistHandler
