import React from 'react';
import ReactRouter from 'react-router';
import Reflux from 'reflux';

import UserActions from '../../../domain/users/user-actions';
import UserStore from '../../../domain/users/user-store';
import AuthStore from '../../../domain/security/auth-store';

import TopMenu from '../widgets/menu/top-menu';
import TimeFrame from '../widgets/table/time-frame';
import Table from '../widgets/table/table';

let calendarWeekly = React.createClass({
  mixins: [
    ReactRouter.History, Reflux.listenTo(UserStore, 'onChange')
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
      <section id="calendar">
        <div className="row">
          <div className="week">
            <div className="col col-7">
              <div className="window">
                <TopMenu/>
                <TimeFrame/>
                <Table/>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

});

export default calendarWeekly;
