import React from 'react';

import PageMenu from '../../core/frame/page-menu';
import UserAccount from '../user-account';
import LangStore from '../../../domain/core/lang/lang-store';

export default class AccountPage extends React.Component {

  constructor(props) {
    super(props);
    this.i18n = LangStore.get();
  }

  pageMenuItems () {
    return {
      title: 'Konto uzytkownika',
      items: [
        {
          id: 'data-tab-1',
          name: this.i18n.users.userProfile,
          uri: '#',
          class: 'fa fa-user',
          selected: true
        }, {
          id: 'data-tab-2',
          name: this.i18n.users.payments,
          uri: '#',
          class: 'fa fa-credit-card'
        }
      ]
    };
  }

  render () {
    return(
      <section id="main-content">
        <PageMenu values={this.pageMenuItems()}/>
        <UserAccount/>
      </section>
    );
  }

}
