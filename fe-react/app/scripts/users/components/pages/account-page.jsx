import React from 'react';

import PageMenu from '../../../core/frame/page-menu';
import UserAccount from '../user-account';

export default class AccountPage extends React.Component {

  render() {
    return (
      <section id="main-content">
        <PageMenu/>
        <UserAccount/>
      </section>
    );
  }

}
