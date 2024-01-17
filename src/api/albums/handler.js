const autoBind = require('auto-bind')
const StorageService = require('../../services/S3/StrorageService')

class AlbumsHandler {
  constructor(service, validator, uploadValidator) {
    this._service = service
    this._validator = validator
    this._uploadValidator = uploadValidator
    this._storageService = new StorageService()

    autoBind(this)
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._service.addAlbum({ name, year })

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    })

    response.code(201)
    return response
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums()
    return {
      status: 'success',
      data: {
        albums,
      },
    }
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params
    const album = await this._service.getAlbumById(id)
    const songs = await this._service.getSongsByAlbumId(id)
    const cover = await this._service.getAlbumCoverById(id)

    const filePath = cover?.path ?? null

    const i = {
      id: album.id,
      name: album.name,
      year: album.year,
      coverUrl: filePath,
    }

    return {
      status: 'success',
      data: {
        album: {
          ...i,
          songs,
        },
      },
    }
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload)
    const { id } = request.params

    await this._service.editAlbumById(id, request.payload)

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    }
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params
    await this._service.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    }
  }

  async postUploadImageHandler(request, h) {
    const { cover } = request.payload
    const { id: albumId } = request.params
    const fileSize = cover._data.length

    if (fileSize > 512000) {
      return h
        .response({
          status: 'fail',
          message: 'Ukuran file terlalu besar',
        })
        .code(413)
    }

    this._uploadValidator.validateImageHeaders(cover.hapi.headers)

    const fileLocation = await this._storageService.writeFile(
      cover,
      cover.hapi,
      albumId
    )

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
      data: {
        fileLocation,
      },
    })
    response.code(201)
    return response
  }

  async postLikeAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.addLikeAlbumById(albumId, credentialId)

    const response = h.response({
      status: 'success',
      message: 'Anda menyukai album ini',
    })

    response.code(201)

    return response
  }

  async getLikeAlbumsHandler(request, h) {
    const { id: albumId } = request.params

    const like = await this._service.getLikeAlbums(albumId)

    const response = h.response({
      status: 'success',
      data: {
        likes: like,
      },
    })

    response.code(200)

    return response
  }

  async deleteLikeAlbumByIdHandler(request) {
    const { id: albumId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.deleteLikeAlbumById(albumId, credentialId)

    return {
      status: 'success',
      message: 'Anda berhasil menghapus like',
    }
  }
}

module.exports = AlbumsHandler
