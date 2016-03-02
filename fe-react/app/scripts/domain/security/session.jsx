import Cookie from 'react-cookie';
import UserUtils from '../users/user-utils'

export default class Session {

  static _CURRENT_USER = 'currentUser';

  getToken() {
    return this.loadUser().token;
  }

  getUserId() {
    return this.loadUser().id;
  }

  getDefaultUser() {
    return {
      'token': null,
      'id': null,
      'role': 'guest',
      'profile': {
        theme: 'turquoise'
      }
    };
  }

  loadUser() {
    var sessionUser = Cookie.load(Session._CURRENT_USER);
    if (sessionUser) {
      return sessionUser;
    } else {
      return this.getDefaultUser();
    }
  }

  create(accessPass) {
    var currentUser = UserUtils.getContactInfo(accessPass.user);
    currentUser.token = accessPass.token;
    currentUser.profile = accessPass.user.profile;
    Cookie.save(Session._CURRENT_USER, currentUser);
  }

  destroy() {
    Cookie.remove(Session._CURRENT_USER);
  }

}
