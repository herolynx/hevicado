var React = require('react');
var ReactRouter = require('react-router');
var Reflux = require('reflux');
var History = ReactRouter.History;

var UserActions = require('../user-actions');
var UserStore = require('../user-store');
var AuthStore = require('../../security/auth-store');

var Account = React.createClass({
  mixins: [
    History, Reflux.listenTo(UserStore, 'onChange')
  ],
  getInitialState: function() {
    return {
      user: {
        profile: {}
      }
    };
  },
  componentWillMount: function() {
    var userId = AuthStore.getUserId();
    var token = AuthStore.getToken();
    UserActions.getUser(userId, token);
  },
  onChange: function(event, user) {
    this.setState({user: user});
  },
  render: function() {
    return (
      <section id="account">
        <div className="row">
          <div className="col col-5">
            <div className="window">
              <div className="title-window">
                <div className="box">
                  <span>
                    Moje konto
                  </span>
                </div>
              </div>
              <div className="tabs-wrapper">
                <div id="tab-1" className="tab-content current">
                  <ul className="list">
                    <li>
                      <div className="info one">
                        <span className="title">Login:</span>
                        <div className="field one">
                          <fieldset>
                            <input type="text" value={this.state.user.email} disabled />
                          </fieldset>
                        </div>
                      </div>
                    </li>
                    <li>
                      <div className="info two">
                        <span className="title">Zmiana hasła:</span>
                        <div className="field">
                          <fieldset>
                            <input type="text" value="" placeholder="Hasło" />
                          </fieldset>
                          <fieldset>
                            <input type="text" value="" placeholder="Powtórz hasło"/>
                          </fieldset>
                        </div>
                        <div className="field">
                          <fieldset>
                            <input type="text" value="" placeholder="Nowe Hasło"/>
                          </fieldset>
                          <fieldset>
                            <button className="btn md blue"><i className="fa fa-unlock-alt"></i> Zmień hasło</button>
                          </fieldset>
                        </div>
                      </div>
                      <div className="action block">

                      </div>
                    </li>

                    <li>
                      <div className="info two">
                        <span className="title">Dane personalne:</span>
                        <div className="field">
                          <fieldset>
                            <input type="text" value={this.state.user.first_name} placeholder="Imię"/>
                          </fieldset>
                          <fieldset>
                            <input type="text" value="" placeholder="Drugie imię"/>
                          </fieldset>
                        </div>
                        <div className="field">
                          <fieldset>
                            <input type="text" value={this.state.user.last_name} placeholder="Nazwisko"/>
                          </fieldset>
                        </div>
                      </div>
                      <div className="action block">
                        <a href="#" id="edit"><i className="fa fa-pencil"></i></a>
                      </div>
                    </li>
                    <li>
                      <div className="info two">
                        <span className="title">Dane adresowe:</span>
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
                    </li>

                    <li>
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
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

});

module.exports = Account;
