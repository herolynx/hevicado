import Reflux from 'reflux';
import LangActions from './lang-actions';
import PL from '../../../../lang/pl.json';
import EN from '../../../../lang/en.json';
import moment from 'moment';
import momentPL from 'moment/locale/pl';
import momentEN from 'moment/locale/en-gb';

let langs = {
  'pl': PL,
  'en': EN
};

let currentLang = undefined;

let langStore = Reflux.createStore({
  listenables: [LangActions],

  /**
  * Handle language change
  *
  * @param newLang: new language to be loaded
  */
  onLangChanged: function(newLang) {
    console.debug('Changing language to: ' + newLang);
    currentLang = langs[newLang];
    moment.locale(newLang);
  },

  /**
  * Get translations for current language
  */
  get: function() {
    return currentLang;
  }

});

console.debug('Loading default language: PL');
langStore.onLangChanged('pl');

export default langStore;
