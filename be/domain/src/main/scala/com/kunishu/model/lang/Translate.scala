package com.kunishu.model.lang

/**
 * Service to translate chosen keys
 *
 * @author Michal Wronski
 * @since 1.2
 */

object Translate {

  //TODO: read from DB
  private def plDegress = Map(
    "$$degree-2" -> "mgr.",
    "$$degree-3" -> "lekarz",
    "$$degree-4" -> "dr. n. med.",
    "$$degree-5" -> "dr. hab. n. med.",
    "$$degree-6" -> "prof. dr. hab. n. med."
  )

  private def plTitles = Map(
    "$$temp-1" -> "Badanie ogólne",
    "$$temp-2" -> "Badania kontrolne",
    "$$temp-3" -> "Badania okresowe"
  )

  /**
   * Translate key template
   * @param translations all available translations
   * @param key key to be translated
   * @param lang language
   * @return translated value, key otherwise
   */
  private def translate(translations: Map[String, String], key: String, lang: String): String = {
    if (!key.startsWith("$$")) {
      return key
    }
    translations.get(key).getOrElse(key)
  }

  /**
   * Translate doctor's degree
   * @param key key to be translated
   * @param lang language
   * @return translated value, key otherwise
   */
  def translateDegree(key: String, lang: String): String = translate(plDegress, key, lang)

  /**
   * Translate visit template title
   * @param key key to be translated
   * @param lang language
   * @return translated value, key otherwise
   */
  def translateVisitTitle(key: String, lang: String): String = translate(plTitles, key, lang)

}
