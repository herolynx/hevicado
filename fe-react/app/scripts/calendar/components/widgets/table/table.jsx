import React from 'react';

import TimeLine from './time-line';
import Box from './table-box';
import Hour from './table-hour';

export default class CalendarTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return(
      <ul className="table">
        <TimeLine/>
        <li className="hour">
          <Hour/>
          <Hour/>
          <Hour/>
          <Hour/>
          <Hour/>
        </li>
        <li>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
        </li>
        <li>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
        </li>
        <li>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
        </li>
        <li>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
        </li>
        <li>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
        </li>
        <li>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
        </li>
        <li>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
          <Box/>
        </li>
      </ul>
    );
  }

}
