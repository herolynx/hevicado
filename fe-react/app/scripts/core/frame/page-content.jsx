var React = require('react');

var PageContent = React.createClass({
  getDefaultProps: function() {
    return {
      mainContent: {
        name: 'Gabinet',
        personalData: 'Twoje dane',
        payments: 'Płatności'
      }
    };
  },
  render: function() {
    return (
      <section id="main-content">
        <div id="title">
          <div className="content">
            <h2>{this.props.mainContent.name}</h2>
            <nav>
              <ul>
                <li className="tab-link current" data-tab="tab-1"><a href="#"><i className="fa fa-user"></i>
                  <span>{this.props.mainContent.personalData}</span></a>
                </li>
                <li className="tab-link" data-tab="tab-2"><a href="#"><i className="fa fa-credit-card"></i>
                  <span>{this.props.mainContent.payments}</span></a>
                </li>
              </ul>
            </nav>
            <div className="action">
              <a href="#"><i className="fa fa-bell-o"></i><span>20</span></a>
              <a href="#"><i className="fa fa-power-off"></i></a>
            </div>
          </div>
        </div>
        {this.props.children}
      </section>
    );
  }

});

module.exports = PageContent;
