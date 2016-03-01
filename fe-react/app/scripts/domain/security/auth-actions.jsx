import Reflux from 'reflux';
import Api from '../core/api';

let authActions = Reflux.createActions({
  'login': {
    children: ['completed', 'failed']
  }
});

let api = new Api();

authActions.login.listen(function(formData) {
  var thisAction = this;
  api.post('/login', formData).then(function(response) {
    if (response.ok === true) {
      return response.json();
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }).then(function(data) {
    thisAction.completed(data);
  }).catch(function(error) {
    thisAction.failed(error.response.status, error.response.statusText);
  });
});

export default authActions;
