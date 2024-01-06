const AuthenticationsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (
    server,
    { authenticationsService, usersSerice, tokenManager, validator }
  ) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersSerice,
      tokenManager,
      validator
    )

    server.route(routes(authenticationsHandler))
  },
}
