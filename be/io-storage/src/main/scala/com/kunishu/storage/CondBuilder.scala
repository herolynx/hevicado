package com.kunishu.storage

import com.kunishu.core.string.RegExp
import com.mongodb.casbah.Imports._

import scala.collection.mutable.ListBuffer

/**
 * Builder of condition chains
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait CondBuilder extends RegExp {

  /**
   * Get criteria value
   * @param values optinal value
   * @return non-nullable value
   */
  private def criteriaOf(values: Option[List[String]]) = values.get.map(matchValue)

  /**
   * Check whether criteria is defined
   * @param values criteria values
   * @return true is criteria is defined, false otherwise
   */
  private def hasCriteria(values: Option[List[String]]) = values.isDefined && !values.get.isEmpty

  /**
   * Add or criteria to given chain
   * @param conds condition chain
   * @param values condition criteria
   * @param attrs condition attributes
   */
  def addCriteria(conds: ListBuffer[DBObject], values: Option[List[String]], attrs: List[String]) = {
    if (hasCriteria(values)) {
      val subConditions = scala.collection.mutable.ListBuffer[DBObject]()
      val condCriteria = criteriaOf(values)
      for (attr <- attrs) {
        subConditions += attr $in condCriteria
      }
      if (!subConditions.isEmpty) {
        conds += $or(subConditions.toList)
      }
    }
  }

  /**
   * Build and condition
   * @param orCriteria or condtions
   * @return non-nullable and condition
   */
  def andCondition(orCriteria: ListBuffer[DBObject]) = if (!orCriteria.isEmpty) $and(orCriteria.toList) else DBObject()

}
