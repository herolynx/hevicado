import Reflux from 'reflux';
import UserActions from './user-actions';
import Api from '../core/api';

let api = new Api();

let userStore = Reflux.createStore({
  listenables: [UserActions],
  user: {},
  getUser: function(userid, token) {
    console.log('user-store: userid=', userid, 'token=', token);
    api.get('/user/' + userid, token).then(function(json) {
      console.log('json: ', json);
      this.user = json;
      this.trigger('change', this.user);
    }.bind(this));
  }
});

export default userStore;
