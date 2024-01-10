exports.up = (pgm) => {
  pgm.addConstraint(
    'songs',
    'fk_songs.album_id_songs.id',
    'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album_id_songs.id')
}
