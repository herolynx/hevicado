package com.kunishu.model.calendar

import com.kunishu.model.user.UsersCriteria
import org.joda.time.DateTime

/**
 * Doctor criteria for searching visits
 */
trait DoctorVisitCriteria extends UsersCriteria {

  lazy val startDate: DateTime = criteria.get("start").map(value => value.asInstanceOf[DateTime]).get

  lazy val endDate: DateTime = criteria.get("end").map(value => value.asInstanceOf[DateTime]).get

}

/**
 * Doctor's search criteria
 * @author Michal Wronski
 * @since 1.0
 */
sealed case class SearchDoctorCriteria(map: Map[String, Any]) extends DoctorVisitCriteria {

  protected override val criteria = map

}

