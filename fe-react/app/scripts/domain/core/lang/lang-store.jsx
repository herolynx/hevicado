import Reflux from 'reflux';
import LangActions from './lang-actions';
import PL from '../../../../lang/pl.json';
import EN from '../../../../lang/en.json';

let langs = {
  'pl': PL,
  'en': EN
};
console.debug('Loading default language: PL');
let currentLang = PL;

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
  },

  /**
  * Get translations for current language
  */
  get: function() {
    return currentLang;
  }

});

export default langStore;
