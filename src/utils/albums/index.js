/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
const mapDBToModelAlbum = ({ id, title, year, created_at, updated_at }) => ({
  id,
  title,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
})

module.exports = mapDBToModelAlbum
