/* eslint-disable no-useless-catch */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const NotFoundError = require('../../exception/NotFoundError')
const AuthorizationError = require('../../exception/AuthorizationError')
const CollaborationsService = require('./CollaborationsService')

class PlaylistsService {
  constructor() {
    this._pool = new Pool()
    this._collaborationsService = new CollaborationsService()
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`
    const createdAt = new Date().toISOString()

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id',
      values: [id, name, owner, createdAt],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id WHERE (users.id = $1 AND playlists.owner = $1) OR (collaborations.user_id = $1)',
      values: [owner],
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async getPlaylistById(id, owner) {
    const query = {
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id WHERE playlists.id = $1 AND (users.id = $2 OR EXISTS ( SELECT 1 FROM collaborations WHERE collaborations.playlist_id = playlists.id AND collaborations.user_id = $2))',
      values: [id, owner],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows[0]
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async addPlaylistSongById({ playlistId, songId }) {
    const id = nanoid(16)

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    }

    const check = {
      text: 'SELECT 1 FROM songs WHERE id = $1',
      values: [songId],
    }

    const songExist = await this._pool.query(check)
    if (!songExist.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist')
    }

    return result.rows[0].id
  }

  async getPlaylistSongs(playlistId) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
      values: [playlistId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows
  }

  async deletePlaylistSongById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist')
    }
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService
