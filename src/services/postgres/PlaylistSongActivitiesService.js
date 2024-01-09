const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const ClientError = require('../../exception/ClientError')
const NotFoundError = require('../../exception/NotFoundError')

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool()
  }

  async addPlaylistActivitiesAdd(playlistId, songId, userId, action) {
    try {
      const id = `activities-${nanoid(16)}`
      const time = new Date().toISOString()

      const query = {
        text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
        values: [id, playlistId, songId, userId, action, time],
      }

      const result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new InvariantError('Activities gagal ditambahkan')
      }

      return result.rows[0].id
    } catch (error) {
      if (error instanceof ClientError) {
        throw error
      }
      throw error
    }
  }

  async getPlaylistActivities(playlistId) {
    const checkPlaylist = {
      text: 'SELECT * FROM playlists where id = $1',
      values: [playlistId],
    }
    const check = await this._pool.query(checkPlaylist)
    if (!check.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    const query = {
      text: 'SELECT pa.playlist_id as "playlistId", u.username as "username", s.title as "title", pa.action, pa.time FROM playlist_activities pa JOIN users u ON pa.user_id = u.id JOIN songs s ON pa.song_id = s.id WHERE pa.playlist_id = $1;',
      values: [playlistId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Activities tidak ditemukan')
    }

    return result.rows
  }
}

module.exports = PlaylistSongActivitiesService
