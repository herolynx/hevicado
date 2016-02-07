var React = require('react');
var createHashHistory = require('history').createHashHistory;
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;

var PageFrame = require('./core//frame/page-frame');
var Login = require('./components/auth/login');
var Account = require('./components/account/account');

var AuthStore = require('./stores/auth-store');

function requireAuth(nextState, replaceState) {
  if (!AuthStore.isLoggedIn()) {
    replaceState({ nextPathname: nextState.location.pathname }, '/login');
  }
}

var Routes = (
  <Router history={createHashHistory({queryKey: false})}>
    <Route path="/login" component={Login}/>
    <Route path="/" component={PageFrame}>
      <IndexRoute component={Account}/>
      <Route path="/account" component={Account} onEnter={requireAuth}/>
    </Route>
  </Router>
);

module.exports = Routes;
