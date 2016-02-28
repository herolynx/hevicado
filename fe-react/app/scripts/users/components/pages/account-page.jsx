import React from 'react';

import PageMenu from '../../../core/frame/page-menu';
import UserAccount from '../user-account';

export default class AccountPage extends React.Component {

  pageMenuItems() {
    return {
      title: 'Konto uzytkownika',
      items: [
        {
          id: 'data-tab-1',
          name: 'Profil uzytkownika',
          uri: '#',
          class: 'fa fa-user',
          selected: true
        }, {
          id: 'data-tab-2',
          name: 'Platnosci',
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
