exports.up = (pgm) => {
  pgm.createTable('album_covers', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    path: {
      type: 'TEXT',
      notNull: true,
    },
  })

  // add constraint FK
  pgm.addConstraint(
    'album_covers',
    'fk_album_cover.album_id_albums.id',
    'FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropTable('album_covers')
}
