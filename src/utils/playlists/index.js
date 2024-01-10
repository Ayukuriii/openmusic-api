/* eslint-disable camelcase */
const mapDBToModelPlaylist = ({
  id, name, owner, created_at, updated_at
}) => ({
  id,
  name,
  owner,
  createdAt: created_at,
  updated_at,
})
module.exports = { mapDBToModelPlaylist }
