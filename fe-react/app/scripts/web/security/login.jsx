import React from 'react';
import ReactRouter from 'react-router';
import Reflux from 'reflux';
import AuthActions from '../../domain/security/auth-actions';
import AuthStore from '../../domain/security/auth-store';

//TODO mixins are deprecated and not supported by react in ES6. use composition instead!
let login = React.createClass({
  mixins: [
    ReactRouter.History, Reflux.listenTo(AuthStore, 'onLoginComplete')
  ],
  getInitialState: function() {
    return {login: '', password: '', error: false, isLogged: false};
  },
  getDefaultProps: function() {
    return {
      windowLogin: {
        name: 'Zaloguj się do systemu',
        email: 'Adres e-mail:',
        password: 'Hasło:',
        signIn: 'Zaloguj się',
        forgotPassword: 'Nie pamiętam hasła ;(',
        loginWithFacebook: 'Zaloguj się przez Facebook',
        loginWithGoogle: 'Zaloguj się przez Google'
      }
    };
  },
  onLoginComplete: function(result) {
    this.setState({user: result.user, isLogged: result.isLogged});
    if (this.state.isLogged === true) {
      this.props.history.replaceState(null, '/account', null);
    } else {
      this.state.error = true;
    }
  },
  handleLogin: function(event) {
    event.preventDefault();
    var formData = new FormData();
    formData.append('login', this.state.login);
    formData.append('password', this.state.password);
    AuthActions.login(formData);
  },
  handleInputLoginChange: function(event) {
    this.setState({login: event.target.value});
  },
  handleInputPasswordChange: function(event) {
    this.setState({password: event.target.value});
  },
  render: function() {
    return (
      <div id="page" className="blue">
        <div id="layer" className="login">
          <div className="content">
            <div className="row">
              <div className="col">
                <div id="form" className="window">
                  <a href="#" id="cw" className="close">
                    <i className="fa fa-times-circle-o"></i>
                  </a>
                  <ul className="field">
                    <li>
                      <span>{this.props.windowLogin.name}</span>
                    </li>
                    <li>
                      <label>{this.props.windowLogin.email}</label>
                      <fieldset>
                        <input type="text" onChange={this.handleInputLoginChange}/>
                      </fieldset>
                    </li>
                    <li className="line">
                      <label>{this.props.windowLogin.password}</label>
                      <fieldset>
                        <input type="password" onChange={this.handleInputPasswordChange}/>
                      </fieldset>
                    </li>
                  </ul>
                  <ul className="action">
                    <li>
                      <button type="submit" className="btn blue md" onTouchTap={this.handleLogin}>
                        <i className="fa fa-sign-in"></i>
                        {this.props.windowLogin.signIn}
                      </button>
                    </li>
                    <li className="block line">
                      <a href="#">
                        <i className="fa fa-question-circle"></i>
                        {this.props.windowLogin.forgotPassword}
                      </a>
                    </li>
                    <li className="block">
                      <a href="#" className="social facebook">
                        <i className="fa fa-facebook"></i>
                        {this.props.windowLogin.loginWithFacebook}
                      </a>
                    </li>
                    <li className="block">
                      <a href="#" className="social google">
                        <i className="fa fa-google-plus"></i>
                        {this.props.windowLogin.loginWithGoogle}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default login;
