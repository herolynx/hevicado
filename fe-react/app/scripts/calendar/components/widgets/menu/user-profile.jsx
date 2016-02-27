import React from 'react';

export default class Legend extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return(
      <div className="profile">
        <div className="image-profile">
          <img src="images/sample-men.jpg" alt="Mateusz Kowalski"/>
          <a href="profile_doctor.html" className="more">
            <i className="fa fa-eye"></i>
          </a>
        </div>
      </div>
    );
  }

}
