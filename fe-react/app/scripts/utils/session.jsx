var Cookie = require('react-cookie');
var UserUtils = require('./user-utils');

module.exports = {
  CURRENT_USER: 'currentUser',
  getToken: function() {
    return this.loadUser().token;
  },
  getUserId: function() {
    return this.loadUser().id;
  },
  getDefaultUser: function() {
    return {
      'token': null,
      'id': null,
      'role': 'guest',
      'profile': {
        theme: 'turquoise'
      }
    };
  },
  loadUser: function() {
    var sessionUser = Cookie.load(this.CURRENT_USER);
    if (sessionUser) {
      return sessionUser;
    } else {
      return this.getDefaultUser();
    }
  },
  create: function(accessPass) {
    var currentUser = UserUtils.getContactInfo(accessPass.user);
    currentUser.token = accessPass.token;
    currentUser.profile = accessPass.user.profile;
    Cookie.save(this.CURRENT_USER, currentUser);
  }
};
