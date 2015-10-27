var Reflux = require('reflux');
var AuthActions = require('../actions/auth-actions');
var Session = require('../utils/session');

var AuthStore = Reflux.createStore({
  listenables: [AuthActions],
  auth: { isLogged: false },
  isLoggedIn: function() {
    return this.getToken() ? true : false;
  },
  getToken: function() {
    return Session.getToken();
  },
  getUserId: function() {
    return Session.getUserId();
  },
  onLoginCompleted: function(response) {
    this.auth.user = response.user;
    this.auth.token = response.token;
    this.auth.isLogged = true;
    Session.create(response);
    this.trigger(this.auth);
  },
  onLoginFailed: function(status, statusText) {
    this.auth.isLogged = false;
    this.trigger(this.auth);
  }
});

module.exports = AuthStore;
