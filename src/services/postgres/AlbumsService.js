const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const { mapDBToModelAlbum } = require('../../utils/albums')
const { mapDBToModelSong } = require('../../utils/songs')
const NotFoundError = require('../../exception/NotFoundError')

class AlbumsService {
  constructor() {
    this._pool = new Pool()
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
}

module.exports = AlbumsService
