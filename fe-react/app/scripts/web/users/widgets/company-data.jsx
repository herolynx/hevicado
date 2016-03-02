import React from 'react';

let companyData = React.createClass({
  render: function() {
    return (
      <div>
        <div className="info two">
          <span className="title">Dane Firmy:</span>
          <div className="field">
            <fieldset>
              <input type="text" value="" placeholder="Nazwa firmy"/>
            </fieldset>
            <fieldset>
              <input type="text" value="" placeholder="NIP"/>
            </fieldset>
          </div>
          <div className="field">
            <fieldset>
              <input type="text" value="" placeholder="Ulica"/>
            </fieldset>
            <fieldset>
              <input type="text" value="" placeholder="Numer domu / mieszkania"/>
            </fieldset>
          </div>
          <div className="field">
            <fieldset>
              <input type="text" value="" placeholder="Kod pocztowy"/>
            </fieldset>
            <fieldset>
              <input type="text" value="" placeholder="Miasto"/>
            </fieldset>
          </div>
          <div className="field">
            <fieldset>
              <select>
                <option value="1">Województwo</option>
                <option value="2">Wtorek</option>
                <option value="3">Środa</option>
                <option value="4">Czwartek</option>
                <option value="5">Piątek</option>
                <option value="6">Sobota</option>
                <option value="7">Niedziela</option>
              </select>
            </fieldset>
            <fieldset>

            </fieldset>
          </div>
        </div>
        <div className="action block">
          <a href="#" id="edit"><i className="fa fa-pencil"></i></a>
        </div>
      </div>
    );
  }
});

export default companyData;
