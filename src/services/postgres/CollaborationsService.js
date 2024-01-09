const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const NotFoundError = require('../../exception/NotFoundError')

class CollaborationsService {
  constructor() {
    this._pool = new Pool()
  }

  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    }

    const check = {
      text: 'SELECT 1 FROM users WHERE id = $1',
      values: [userId],
    }

    const checkResult = await this._pool.query(check)
    if (!checkResult.rowCount) {
      throw new NotFoundError('User tidak ditemukan')
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Kolaboratis gagal diverifikasi')
    }
  }
}

module.exports = CollaborationsService
