const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const { mapDBToModelAlbum } = require('../../utils/albums')
const { mapDBToModelSong } = require('../../utils/songs')
const NotFoundError = require('../../exception/NotFoundError')

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16)
    const createdAt = new Date().toISOString()

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, year, createdAt],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums')

    return result.rows.map(mapDBToModelAlbum)
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return mapDBToModelAlbum(result.rows[0])
  }

  async getAlbumCoverById(id) {
    const query = {
      text: 'SELECT path FROM album_covers WHERE album_id = $1 LIMIT 1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      return null
    }

    return result.rows[0]
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT * FROM songs where album_id = $1',
      values: [albumId],
    }

    const result = await this._pool.query(query)

    return result.rows.map(mapDBToModelSong)
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString()

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan.')
    }
  }

  async addLikeAlbumById(albumId, userId) {
    const id = nanoid(16)

    const checkAlbum = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [albumId],
    }
    const checkAlbumResult = await this._pool.query(checkAlbum)
    if (!checkAlbumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    const checkQuery = {
      text: 'SELECT COUNT(*) FROM likes WHERE user_id = $2 AND album_id = $1',
      values: [albumId, userId],
    }
    const checkResult = await this._pool.query(checkQuery)
    if (checkResult.rows[0].count > 0) {
      throw new InvariantError('Anda telah menyukai album ini sebelumnya')
    }

    const insertQuery = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, albumId, userId],
    }
    const result = await this._pool.query(insertQuery)
    if (!result.rowCount) {
      throw new InvariantError('Gagal menambahkan like')
    }

    await this._cacheService.delete(`albumsLike:${albumId}`)

    return result.rows[0]
  }

  async getLikeAlbums(albumId) {
    try {
      const result = await this._cacheService.get(`albumsLike:${albumId}`)

      return {
        like: JSON.parse(result),
        source: 'cache',
      }
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) AS total_likes FROM likes WHERE album_id = $1',
        values: [albumId],
      }

      const result = await this._pool.query(query)

      const totalLikes = result.rows.length > 0 ? parseInt(result.rows[0].total_likes, 10) : 0

      await this._cacheService.set(
        `albumsLike:${albumId}`,
        JSON.stringify(totalLikes)
      )

      return {
        like: totalLikes,
        source: 'db',
      }
    }
  }

  async deleteLikeAlbumById(albumId, userId) {
    const query = {
      text: 'DELETE FROM likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Gagal menghapus like')
    }
    await this._cacheService.delete(`albumsLike:${albumId}`)
  }
}

module.exports = AlbumsService
