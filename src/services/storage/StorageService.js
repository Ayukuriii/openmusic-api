const fs = require('fs')
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exception/InvariantError')

class StorageService {
  constructor(folder) {
    this._pool = new Pool()
    this._folder = folder
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
  }

  async writeFile(file, meta, albumId) {
    const filename = +new Date() + meta.filename
    const path = `${this._folder}/${filename}`
    const id = `cover-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO album_covers VALUES($1, $2, $3)',
      values: [id, albumId, path],
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Cover gagal ditambahkan')
    }

    const fileStream = fs.createWriteStream(path)

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error))
      file.pipe(fileStream)
      file.on('end', () => resolve(filename))
    })
  }
}

module.exports = StorageService
