import React from 'react';

import PageMenu from '../../../core/frame/page-menu';
import CalendarWeekly from '../views/calendar-weekly';

export default class CalendarPage extends React.Component {

  pageMenuItems() {
    return {
      title: 'Kalendarz',
      items: [
        {
          id: 'data-tab-1',
          name: 'Dzienny',
          uri: '#',
          class: 'fa fa-calendar'
        }, {
          id: 'data-tab-2',
          name: 'Tygodniowy',
          uri: '#/calendar/weekly',
          class: 'fa fa-calendar',
          selected: true
        }
      ]
    };
  }

  render () {
    return(
      <section id="main-content">
        <PageMenu values={this.pageMenuItems()}/>
        <CalendarWeekly/>
      </section>
    );
  }

}
