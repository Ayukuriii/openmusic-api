const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const { mapDBToModel } = require('../../utils/albums')

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
      throw new InvariantError('Catatan gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums')

    return result.rows.map(mapDBToModel)
  }
}

module.exports = AlbumService
