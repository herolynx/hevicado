import React from 'react';
import {Router, Route, IndexRoute} from 'react-router';
import createHashHistory from 'history/lib/createHashHistory';

import PageFrame from './core/frame/page-frame';
import Login from './security/components/login';
import Account from './users/components/user-account';

import AuthStore from './security/auth-store';

function requireAuth(nextState, replaceState) {
  if (!AuthStore.isLoggedIn()) {
    replaceState({nextPathname: nextState.location.pathname}, '/login');
  }
}

let routes = (
  <Router history={createHashHistory({queryKey: false})}>
    <Route path="/login" component={Login}/>
    <Route path="/" component={PageFrame}>
      <IndexRoute component={Account}/>
      <Route path="/account" component={Account} onEnter={requireAuth}/>
    </Route>
  </Router>
);

export default routes;
