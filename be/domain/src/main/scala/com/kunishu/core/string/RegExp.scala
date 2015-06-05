package com.kunishu.core.string

/**
 * Generic functions related with building and usage of of reg exp
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait RegExp {

  /**
   * Wrap value into regular expression
   * @param value value to be wrapped
   * @return non-nullable regular expression
   */
  def matchValue(value: String) = ("(?i)" + value).r

  /**
   * Filter value by given criteria.
   * If criteria are not given then all values will be accepted.
   * @param criteria reg exp values
   * @param value value to be checked
   * @return true if value was accepted, false otherwise
   */
  def multiMatch(criteria: Option[List[String]])(value: String): Boolean =
    criteria match {
      case None => true

      case Some(parts) => {
        if (parts.isEmpty) {
          return true
        } else {
          parts.filter(part => matchValue(part).findFirstIn(value).isDefined).nonEmpty
        }
      }
    }

}
