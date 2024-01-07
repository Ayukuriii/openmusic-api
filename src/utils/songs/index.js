/* eslint-disable camelcase */
const mapDBToModelSong = ({
  id,
  album_id,
  title,
  year,
  genre,
  performer,
  duration,
  created_at,
  updated_at,
}) => ({
  id,
  albumId: album_id,
  title,
  year,
  genre,
  performer,
  duration,
  createdAt: created_at,
  updated_at,
})

module.exports = { mapDBToModelSong }
