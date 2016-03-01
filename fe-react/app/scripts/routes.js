import React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import createHashHistory from 'history/lib/createHashHistory';

import PageFrame from './web/core/frame/page-frame';
import Login from './web/security/login';
import AccountPage from './web/users/pages/account-page';
import CalendarPage from './web/calendar/pages/calendar-page';

import AuthStore from './domain/security/auth-store';

function requireAuth(nextState, replaceState) {
  if (!AuthStore.isLoggedIn()) {
    replaceState({nextPathname: nextState.location.pathname}, '/login');
  }
}

let routes = (
  <Router history={createHashHistory({queryKey: false})}>
    <Route path="/login" component={Login}/>
    <Route path="/" component={PageFrame}>
      <IndexRoute component={AccountPage}/>
      <Route path="/account" component={AccountPage} onEnter={requireAuth}/>
      <Route path="/calendar/weekly" component={CalendarPage} />
    </Route>
  </Router>
);

export default routes;
