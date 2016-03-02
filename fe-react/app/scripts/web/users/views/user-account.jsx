import React from 'react';
import ReactRouter from 'react-router';
import Reflux from 'reflux';

import UserActions from '../../../domain/users/user-actions';
import UserStore from '../../../domain/users/user-store';
import AuthStore from '../../../domain/security/auth-store';

import LoginData from '../widgets/login-data';
import PasswordChange from '../widgets/password-change';
import PortalTheme from '../widgets/portal-theme';
import ProfilePicture from '../widgets/profile-picture';
import PersonalData from '../widgets/personal-data';
import AddressData from '../widgets/address-data';
import CompanyData from '../widgets/company-data';

//TODO mixins are deprecated and not supported by react in ES6. use composition instead!
let userAccount = React.createClass({
  mixins: [
    ReactRouter.History, Reflux.listenTo(UserStore, 'onChange')
  ],
  getDefaultProps: function() {
    return {
      windowAccount: {
        myAccount: 'Moje konto',
        login: 'Login',
        passwordChange: 'Zmiana hasła:',
        changePassword: 'Zmień hasło',
        portalColor: 'Kolor serwisu:',
        personalData: 'Dane personalne'
      }
    };
  },
  getInitialState: function() {
    return {
      user: {
        profile: {}
      }
    };
  },
  componentWillMount: function() {
    var userId = AuthStore.getUserId();
    var token = AuthStore.getToken();
    UserActions.getUser(userId, token);
  },
  onChange: function(event, user) {
    this.setState({user: user});
  },
  render: function() {
    return (
      <section id="account">
        <div className="row">
          <div className="col col-5">
            <div className="window">
              <div className="title-window">
                <div className="title">
                    {this.props.windowAccount.myAccount}
                </div>
              </div>
              <div className="tabs-wrapper">
                <div id="tab-1" className="tab-content current">
                  <ul className="list">
                    <li>
                      <LoginData windowAccount={this.props.windowAccount} user={this.state.user} />
                    </li>
                    <li>
                      <PasswordChange user={this.state.user} />
                    </li>
                    <li>
                      <PortalTheme />
                    </li>
                    <li>
                      <ProfilePicture />
                    </li>
                    <li>
                      <PersonalData user={this.state.user} />
                    </li>
                    <li>
                      <AddressData />
                    </li>
                    <li>
                      <CompanyData/>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

});

export default userAccount;
