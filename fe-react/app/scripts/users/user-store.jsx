var Reflux = require('reflux');
var UserActions = require('./user-actions');
var Api = require('../core/api');

var UserStore = Reflux.createStore({
  listenables: [UserActions],
  user: {},
  getUser: function(userid, token) {
    console.log('user-store: userid=', userid, 'token=', token);
    Api.get('/user/' + userid, token)
      .then(function(json){
        console.log('json: ', json);
        this.user = json;
        this.trigger('change', this.user);
      }.bind(this));
  }
});

module.exports = UserStore;
