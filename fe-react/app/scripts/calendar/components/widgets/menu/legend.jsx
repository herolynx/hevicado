import React from 'react';

export default class Legend extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (

        <div className="legend">
          <div className="position">
            <ul>
              <li><span className="title">Gabinety:</span></li>
              <li><span style={{'background':'pink'}}></span><a href="#">NFZ Róża</a></li>
              <li><span style={{'background':'yellow'}}></span><a href="#">Remedis</a></li>
            </ul>
            <ul>
              <li><span className="title">Badania:</span></li>
              <li><span style={{'background':'green'}}></span><a href="#">Badanie kontrolne (10 min)</a></li>
              <li><span style={{'background':'red'}}></span><a href="#">Ekstrakcja zęba (20 min)</a></li>
              <li><span style={{'background':'orange'}}></span><a href="#">Wybielanie zębów (10 min)</a></li>
            </ul>
          </div>
        </div>
    );
  }

}
