const { Pool } = require('pg')

class PlaylistsService {
  constructor() {
    this._pool = new Pool()
  }

  async getPlaylists(playlistId) {
    const query = {
      text: `
            SELECT 
              playlists.id AS playlist_id, 
              playlists.name AS playlist_name,
              songs.id AS song_id,
              songs.title AS song_title,
              songs.performer AS song_performer
            FROM 
              playlists
            JOIN 
              playlist_songs ON playlists.id = playlist_songs.playlist_id
            JOIN 
              songs ON playlist_songs.song_id = songs.id
            WHERE 
              playlists.id = $1
          `,
      values: [playlistId],
    }

    const result = await this._pool.query(query)

    const playlistData = {
      playlist: {
        id: result.rows[0].playlist_id,
        name: result.rows[0].playlist_name,
        songs: result.rows.map((row) => ({
          id: row.song_id,
          title: row.song_title,
          performer: row.song_performer,
        })),
      },
    }

    return playlistData
  }
}

module.exports = PlaylistsService
