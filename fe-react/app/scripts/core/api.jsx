var Fetch = require('whatwg-fetch');
var rootUrl = 'https://hevicado.com/be';

module.exports = {
  post: function(url, data) {
    return fetch(rootUrl + url, {method: 'POST', body: data}).then(function(response) {
      return response;
    }).catch(function(error) {
      return error;
    });
  },
  get: function(url, token) {
    return fetch(rootUrl + url, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    }).then(function(response) {
      return response.json();
    }).catch(function(error) {
      return error;
    });
  }
};
