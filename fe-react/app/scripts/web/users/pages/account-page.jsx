import React from 'react';

import PageMenu from '../../core/frame/page-menu';
import UserAccount from '../views/user-account';
import LangStore from '../../../domain/core/lang/lang-store';

export default class AccountPage extends React.Component {

  constructor(props) {
    super(props);
    this.i18n = LangStore.get();
  }

  pageMenuItems() {
    return {
      title: 'Kalendarz',
      items: [
        {
          id: 'data-tab-1',
          name: this.i18n.calendar.daily,
          uri: '#',
          class: 'fa fa-calendar'
        }, {
          id: 'data-tab-2',
          name: this.i18n.calendar.weekly,
          uri: '#/calendar/weekly',
          class: 'fa fa-calendar',
          selected: true
        }
      ]
    };
  }

  render() {
    return (
      <section id="main-content">
        <PageMenu values={this.pageMenuItems()}/>
        <UserAccount/>
      </section>
    );
  }

}
