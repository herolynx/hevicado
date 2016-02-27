import React from 'react';

import Legend from './legend';
import UserProfile from './user-profile';
import DayPicker from './day-picker';

export default class CalendarMenu extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return(
      <div className="title-window">
        <div className="row">
          <DayPicker/>
          <UserProfile/>
        </div>
        <Legend/>
      </div>
    );
  }

}
