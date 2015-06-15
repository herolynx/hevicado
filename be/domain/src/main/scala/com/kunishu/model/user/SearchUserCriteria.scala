package com.kunishu.model.user

import com.kunishu.model.SearchCriteria

object UsersCriteria {

  val attName = "name"
  val attLocation = "location"
  val attSpecializations = "specializations"
  val attRoles = "roles"

}

/**
 * Criteria for searching users
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UsersCriteria extends SearchCriteria {

  import UsersCriteria._

  lazy val name: Option[String] = criteria.get(attName).map(value => value.toString)

  final def nameParts: Option[List[String]] = name.map(name => name.toString.split(' ')).map(array => array.toList)

  lazy val location: Option[String] = criteria.get(attLocation).map(value => value.toString)

  final def locationParts: Option[List[String]] = location.map(place => place.split(' ')).map(array => array.toList)

  lazy val specializations: Option[List[String]] = criteria.
    get(attSpecializations).
    map(value => value.asInstanceOf[List[String]]).
    map(specs => specs.map(spec => spec.replace("$", "\\$")))

  lazy val roles: Option[List[String]] = criteria.get(attRoles).map(value => value.asInstanceOf[List[String]])

}

sealed case class SearchUserCriteria(map: Map[String, Any], contactInfoOnly: Boolean = true) extends UsersCriteria {

  protected override val criteria = map

}


