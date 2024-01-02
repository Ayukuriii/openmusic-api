/* eslint-disable object-curly-newline */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const mapDBToModelSong = require('../../utils/songs')
const NotFoundError = require('../../exception/NotFoundError')

class SongsService {
  constructor() {
    this._pool = new Pool()
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = nanoid(16)
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [
        id,
        albumId,
        title,
        year,
        genre,
        performer,
        duration,
        createdAt,
        updatedAt,
      ],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongs() {
    const result = await this._pool.query('SELECT * FROM songs')

    return result.rows.map(mapDBToModelSong)
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapDBToModelSong)[0]
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString()

    const query = {
      text: 'UPDATE songs SET album_id = $2, title = $3, year = $4, genre = $5, performer = $6, duration = $7, updated_at = $8 WHERE id = $1 RETURNING id',
      values: [id, albumId, title, year, genre, performer, duration, updatedAt],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = SongsService
