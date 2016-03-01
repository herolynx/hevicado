import React from 'react';

export default class ProfilePicture extends React.Component {

  render() {
    return (
      <div>
        <div className="info one">
          <span className="title">Zdjęcie profilowe:</span>
          <div className="field">
            <div className="images">
              <img src="images/sample-men.jpg" alt="Mateusz Kowalski"/>
              <a href="#"><i className="fa fa-trash-o"></i></a>
            </div>
          </div>
        </div>
        <div className="action block">
          <input type="file" name="file" id="file" className="input-file"/>
          <label className="upload" htmlFor="file"><i className="fa fa-upload"></i></label>
        </div>
      </div>
    );
  }
}
