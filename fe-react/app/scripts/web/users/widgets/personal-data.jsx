import React from 'react';

export default class PersonalData extends React.Component {
  render() {
    return (
      <div>
        <div className="info two">
          <span className="title">Dane personalne:</span>
          <div className="field">
            <fieldset className="error">
              <div className="validation">
                Wypełnij pole
              </div>
              <input type="text" value={this.props.user.first_name} placeholder="Imię"/>
            </fieldset>
            <fieldset>
              <input type="text" value={this.props.user.middle_name} placeholder="Drugie imię"/>
            </fieldset>
          </div>
          <div className="field">
            <fieldset>
              <input type="text" value={this.props.user.last_name} placeholder="Nazwisko"/>
            </fieldset>
          </div>
        </div>
        <div className="action block">
          <a href="#" id="edit"><i className="fa fa-pencil"></i></a>
        </div>
      </div>
    );
  }
}
