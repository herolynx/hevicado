import React from 'react';

import UserActions from '../../../domain/users/user-actions';
import AuthStore from '../../../domain/security/auth-store';

export default class PasswordChange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {password1: '', password2: ''};
  }
  handleInputPassword1(event) {
    this.setState({ password1: event.target.value });
  }
  handleInputPassword2(event) {
    this.setState({ password2: event.target.value });
  }
  handleChangePassword(event) {
    event.preventDefault();
    if (this.state.password1 === this.state.password2) {
      var user = {
        id: this.props.user.id,
        email: this.props.user.email,
        password: this.state.password1
      };
      UserActions.updateUser(user, AuthStore.getToken());
    } else {
      console.log('Passwords does not match');
    }
  }
  render() {
    return (
      <div className="info two">
        <span className="title">Zmiana hasła:</span>
        <div className="field">
          <fieldset>
            <input type="text" value="" placeholder="Hasło"/>
          </fieldset>
        </div>
        <div className="field">
          <fieldset>
            <input type="text" placeholder="Powtórz hasło" onChange={this.handleInputPassword1.bind(this)}/>
          </fieldset>
        </div>
        <div className="field">
          <fieldset>
            <input type="text" placeholder="Nowe Hasło" onChange={this.handleInputPassword2.bind(this)}/>
          </fieldset>
          <fieldset>
            <button className="btn md blue" onTouchTap={this.handleChangePassword.bind(this)}>
              <i className="fa fa-unlock-alt"></i> Zmień hasło
            </button>
          </fieldset>
        </div>
      </div>
    );
  }
}
