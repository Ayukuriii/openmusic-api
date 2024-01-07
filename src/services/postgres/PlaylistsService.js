const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')
const NotFoundError = require('../../exception/NotFoundError')
const AuthorizationError = require('../../exception/AuthorizationError')
const { mapDBToModelPlaylist } = require('../../utils/playlists')

class PlaylistsService {
  constructor() {
    this._pool = new Pool()
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
      text: 'SELECT playlists.id, playlists.name, users.username FROM playlists JOIN users ON playlists.owner = users.id WHERE users.id = $1',
      values: [owner],
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return mapDBToModelPlaylist(result.rows[0])
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
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
    console.log(result.rows[0])

    return result.rows[0].id
  }

  async getPlaylistSongs(playlist_id) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs JOIN playlist_songs ON songs.id = playlist_songs.id WHERE playlist_songs.palylist_id = $1',
      values: [playlist_id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
    return result.rows.map(mapDBToModelPlaylist)
  }

  async deletePlaylistSongById(playlist_id, song_id) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1, AND song_id = $2 RETURNING id',
      values: [playlist_id, song_id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist')
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }
}

module.exports = PlaylistsService
