var React = require('react');
var MainMenu = require('./main-menu');
var PageContent = require('./page-content');

var PageFrame = React.createClass({
  render: function() {
    return (
      <div id="page" className="blue">
        <input type="checkbox" id="trigger" className="trigger" />
        <label htmlFor="trigger">
          <i className="fa fa-bars"></i>
        </label>
        <MainMenu />
        <PageContent>
          {this.props.children}
        </PageContent>
      </div>
    );
  }
});

module.exports = PageFrame;
