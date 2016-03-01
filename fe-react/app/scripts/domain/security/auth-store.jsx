import Reflux from 'reflux';
import AuthActions from './auth-actions';
import Session from './session';

let session = new Session();

let authStore = Reflux.createStore({
  listenables: [AuthActions],
  auth: {
    isLogged: false
  },
  isLoggedIn: function() {
    return this.getToken() ? true : false;
  },
  getToken: function() {
    return session.getToken();
  },
  getUserId: function() {
    return session.getUserId();
  },
  onLoginCompleted: function(response) {
    this.auth.user = response.user;
    this.auth.token = response.token;
    this.auth.isLogged = true;
    session.create(response);
    this.trigger(this.auth);
  },
  onLoginFailed: function(status, statusText) {
    this.auth.isLogged = false;
    this.trigger(this.auth);
  }
});

export default authStore;
