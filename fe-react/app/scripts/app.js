var ReactDOM = require('react-dom');
var Routes = require('./routes');
var injectTapEventPlugin = require('react-tap-event-plugin');

injectTapEventPlugin();

ReactDOM.render(Routes, document.getElementById('hevicado'));
