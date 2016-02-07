var React = require('react');
var createHashHistory = require('history').createHashHistory;
var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var IndexRoute = ReactRouter.IndexRoute;

var PageFrame = require('./core//frame/page-frame');
var Login = require('./security/components/login');
var Account = require('./users/components/user-account');

var AuthStore = require('./security/auth-store');

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
