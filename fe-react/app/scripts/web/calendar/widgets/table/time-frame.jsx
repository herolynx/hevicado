import React from 'react';

export default class CalendarDays extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return(
      <ul className="days">
        <li className="hour"></li>
        <li>PN
          <span>29.03.15</span>
        </li>
        <li>WT
          <span>29.03.15</span>
        </li>
        <li>ŚR
          <span>29.03.15</span>
        </li>
        <li>CZW
          <span>29.03.15</span>
        </li>
        <li>PT
          <span>29.03.15</span>
        </li>
        <li>SOB
          <span>29.03.15</span>
        </li>
        <li>ND
          <span>29.03.15</span>
        </li>
      </ul>
    );
  }

}
