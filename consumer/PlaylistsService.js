const { Pool } = require('pg')

class PlaylistsService {
  constructor() {
    this._pool = new Pool()
  }

  async getPlaylists(userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner = $1',
      values: [userId],
    }

    const result = await this._pool.query(query)
    return result.rows
  }
}

module.exports = PlaylistsService
