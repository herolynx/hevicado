var Reflux = require('reflux');
var Api = require('../core/api');

var AuthActions = Reflux.createActions({
  'login': {children: ['completed', 'failed']}
});

AuthActions.login.listen(function(formData) {
  var thisAction = this;
  Api.post('/login', formData)
    .then(function(response) {
      if (response.ok === true) {
        return response.json();
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
      }
    }).then(function(data) {
      thisAction.completed(data);
    }).catch(function(error) {
      thisAction.failed(error.response.status, error.response.statusText);
    });
});

module.exports = AuthActions;
