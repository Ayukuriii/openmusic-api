const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/InvariantError')

class StorageService {
  constructor() {
    this._pool = new Pool()
    this._s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async writeFile(file, meta, albumId) {
    const id = nanoid(16)

    const parameter = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: meta.filename,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    })

    await this._s3.send(parameter)

    const url = await this.createPreSignedUrl({
      bucket: process.env.AWS_BUCKET_NAME,
      key: meta.filename,
    })

    const query = {
      text: 'INSERT INTO album_covers VALUES($1, $2, $3)',
      values: [id, albumId, url],
    }

    const result = await this._pool.query(query)
    if (!result.rowCount) {
      throw new InvariantError('Gagal membuat link Url')
    }
    console.log(url)
    return url
  }

  async createPreSignedUrl({ bucket, key }) {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    const url = getSignedUrl(this._s3, command, { expiresIn: 3600 })

    return url
  }
}

module.exports = StorageService
