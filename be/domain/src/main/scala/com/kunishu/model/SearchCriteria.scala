package com.kunishu.model

/**
 * Basic search criteria
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait SearchCriteria {

  protected val criteria: Map[String, Any]

  lazy val startIndex: Int = criteria.get("startIndex").map(value => value.toString.toInt).getOrElse(0)

  lazy val count: Int = criteria.get("count").map(value => value.toString.toInt).getOrElse(10)

}
