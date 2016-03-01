import React from 'react';

export default class MainMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: props.user
    };
  }

  static defaultProps = {
    navigation: {
      youAreloggedAs: 'Jesteś zalogowany jako',
      poweredBy: 'Powered by'
    },
    user: {
      firstName: 'Mateusz',
      lastName: 'Kowalski',
      profile: 'Lekarz'
    }
  };

  getUserName() {
    return this.state.user.firstName + ' ' + this.state.user.lastName;
  }

  render() {
    return (
      <section id="navigation">
        <div className="user">
          <span>{this.props.navigation.youAreloggedAs}</span>
          <div className="images">
            <img src="images/sample-men.jpg" alt={this.getUserName()}/>
          </div>
          <span className="name">
            <a href="my_account.html">
              {this.state.user.firstName}<br/>{this.state.user.lastName}
            </a>
          </span>
          <span>{this.state.user.profile}</span>
          <div className="switch">
            <input type="checkbox" name="switch" className="switch-checkbox" id="id5a"/>
            <label className="switch-label" htmlFor="id5a"></label>
          </div>
        </div>
        <nav>
          <ul>
            <li className="active"><a href="search.html"><i className="fa fa-search"></i> Szukaj</a></li>
            <li><a href="dashboard.html"><i className="fa fa-area-chart"></i>Pulpit</a></li>
            <li><a href="#/calendar/weekly"><i className="fa fa-calendar"></i>Kalnedarz</a></li>
            <li><a href="#"><i className="fa fa-folder-open-o"></i>Karta Pacjenta</a></li>
            <li><a href="visit.html"><i className="fa fa-folder-open-o"></i>Moje wizyty</a></li>
            <li><a href="cabinet_list.html"><i className="fa fa-hospital-o"></i>Gabinet</a></li>
            <li><a href="message.html"><i className="fa fa-inbox"></i>Wiadomości</a></li>
            <li><a href="my_account.html"><i className="fa fa-cogs"></i>Moje konto</a></li>
            <li><a href="statistic.html"><i className="fa fa-bar-chart"></i>Statystyki</a></li>
            <li><a href="#"><i className="fa fa-sign-out"></i>Wyloguj</a></li>
          </ul>
        </nav>
        <div className="footer">
          {this.props.navigation.poweredBy}
          <a href="http://www.herolynx.com" target="_blank">HeroLynx.com</a>
        </div>
      </section>
    );
  }

}
