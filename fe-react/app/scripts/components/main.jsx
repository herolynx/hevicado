var React = require('react');
var Navbar = require('./navigation/navbar');
var MainContent = require('./main-content');

var Main = React.createClass({
  render: function() {
    return (
      <div id="page" className="blue">
        <input type="checkbox" id="trigger" className="trigger" />
        <label htmlFor="trigger">
          <i className="fa fa-bars"></i>
        </label>
        <Navbar />
        <MainContent>
          {this.props.children}
        </MainContent>
      </div>
    );
  }
});

module.exports = Main;
