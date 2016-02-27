import React from 'react';

export default class DayPicker extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return(
      <div className="title date">
        <span>Styczeń 2016</span>
        <div className="action">
          <a href="#" className="btn-arrow">
            <i className="fa fa-angle-left"></i>
          </a>
          <a href="#" className="btn-arrow">
            <i className="fa fa-angle-right"></i>
          </a>
          <a href="#" className="btn-calendar">
            <i className="fa fa-calendar"></i>
          </a>
          <a href="#" className="btn-legend">
            <i className="fa fa-file-text-o"></i>
          </a>
        </div>
      </div>
    );
  }

}
