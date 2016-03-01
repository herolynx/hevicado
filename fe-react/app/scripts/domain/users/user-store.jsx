import Reflux from 'reflux';
import UserActions from './user-actions';
import Api from '../core/api';
import Session from '../security/session';

let api = new Api();
let session = new Session();

let userStore = Reflux.createStore({
  listenables: [UserActions],
  user: {},
  getUser: function(userid, token) {
    api.get('/user/' + userid, token)
      .then(function(response) {
        if (response.status === 401) {
          session.destroy();
          return {};
        } else {
          return response.json();
        }
      }).then(function(json) {
        this.user = json;
        this.trigger('change', this.user);
      }.bind(this));
  },
  updateUser: function(user, token) {
    api.put('/user', user, token)
      .then(function(response) {
        if (response.status === 401) {
          session.destroy();
          return false;
        } else {
          return true;
        }
      }.bind(this));
  }
});

export default userStore;
