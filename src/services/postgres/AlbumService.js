const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const { mapDBToModel } = require('../../utils/albums')
const NotFoundError = require('../../exception/NotFoundError')

class AlbumService {
  constructor() {
    this._pool = Pool
  }

  async addAlbum({ title, year }) {
    const id = nanoid(16)
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, title, year, createdAt, updatedAt],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums')

    return result.rows.map(mapDBToModel)
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return result.rows.map(mapDBToModel)[0]
  }

  async editAlbumById(id, { title, year }) {
    const updatedAt = new Date().toISOString()

    const query = {
      text: 'UPDATE albums SET title = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [title, year, updatedAt, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan.')
    }
  }
}

module.exports = AlbumService
