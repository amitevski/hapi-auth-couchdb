/**
 * Created by acomitevski on 21/09/14.
 */

'use strict';

// Load modules

var Boom = require('boom');
var Hoek = require('hoek');


// Declare internals

var internals = {};


exports.register = function (plugin, options, next) {

  plugin.auth.scheme('couchdb', internals.implementation);
  next();
};


exports.register.attributes = {
  pkg: require('../package.json')
};


internals.implementation = function (server, options) {

  Hoek.assert(options, 'Missing couch auth strategy options');
  Hoek.assert(typeof options.validateFunc === 'function', 'options.validateFunc must be a valid function in basic scheme');

  var settings = Hoek.clone(options);

  var scheme = {
    authenticate: function (request, reply) {


      var authSession = request.state.AuthSession;
      if (!authSession) {
        return reply(Boom.unauthorized(null, 'couchdb'));
      }


      settings.validateFunc(authSession, function (err, isValid, credentials) {

        credentials = credentials || null;

        if (err) {
          return reply(err, null, {credentials: credentials});
        }

        if (!isValid) {
          return reply(Boom.unauthorized('Invalid Session', 'couchdb'), null, { credentials: credentials });
        }

        if (!credentials ||
          typeof credentials !== 'object') {

          return reply(Boom.badImplementation('Bad credentials object received for couchdb auth validation'), { log: { tags: 'credentials' } });
        }

        // Authenticated
        return reply.continue({ credentials: credentials });
      });
    }
  };

  return scheme;
};

