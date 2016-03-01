import Reflux from 'reflux';
import CalendarActions from './calendar-actions';
import Api from '../core/api';

let api = new Api();

let calendarStore = Reflux.createStore({
  listenables: [CalendarActions]
});

export default calendarStore;
