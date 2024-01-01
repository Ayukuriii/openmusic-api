require('dotenv').config()

const Hapi = require('@hapi/hapi')
const ClientError = require('./exception/ClientError')

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  await server.register({})

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    // handle client error
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      })
      newResponse.code(response.statusCode)
      return newResponse
    }
    return h.continue
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
