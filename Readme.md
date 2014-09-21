### hapi-auth-couchdb

Lead Maintainer: [Aco Mitevski](https://github.com/amitevski)

CouchDB authentication requires validating a AuthSession Cookie. The `'couchdb'` scheme takes the following options:

- `validateFunc` - (required) a user lookup and password validation function with the signature `function(username, password, callback)` where:
    - `AuthSession` - the AuthSession cookie received from the client.
    - `callback` - a callback function with the signature `function(err, isValid, credentials)` where:
        - `err` - an internal error.
        - `isValid` - `true` if both the username was found and the password matched, otherwise `false`.
        - `credentials` - a credentials object passed back to the application in `request.auth.credentials`. Typically, `credentials` are only
          included when `isValid` is `true`, but there are cases when the application needs to know who tried to authenticate even when it fails
          (e.g. with authentication mode `'try'`).

```javascript

var validate = function (username, callback) {

    var validate = function(authSession, cb) {
        helpers.API.authCheck(authSession)
          .then(function(user) {
            cb(null, true, user);
          }, function(err) {
            cb(err, false, null);
          });
      };
};

server.pack.register(require('hapi-auth-couchdb'), function (err) {

    server.auth.strategy('simple', 'couchdb', { validateFunc: validate });
    server.route({ method: 'GET', path: '/', config: { auth: 'simple' } });
});
```
