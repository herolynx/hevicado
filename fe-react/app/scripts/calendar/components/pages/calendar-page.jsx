import React from 'react';

import PageMenu from '../../../core/frame/page-menu';
import CalendarWeekly from '../views/calendar-weekly';

export default class CalendarPage extends React.Component {

  render() {
    return (
      <section id="main-content">
        <PageMenu/>
        <CalendarWeekly/>
      </section>
    );
  }

}
