import Fetch from 'whatwg-fetch';

const rootUrl = 'https://hevicado.com/be';

export default class Api {

  post(url, data) {
    return fetch(rootUrl + url, {
      method: 'POST',
      body: data
    }).then(function(response) {
      return response;
    }).catch(function(error) {
      return error;
    });
  }

  get(url, token) {
    return fetch(rootUrl + url, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    }).then(function(response) {
      return response;
    }).catch(function(error) {
      return error;
    });
  }

  put(url, jsonObject, token) {
    return fetch(rootUrl + url, {
      method: 'PUT',
      body: JSON.stringify(jsonObject),
      headers: {
        'Authorization': token
      }
    }).then(function(response) {
      return response;
    }).catch(function(error) {
      return error;
    });
  }


}
