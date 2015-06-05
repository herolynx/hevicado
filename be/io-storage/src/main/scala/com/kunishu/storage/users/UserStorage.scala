package com.kunishu.storage.users

import com.kunishu.core.string.RegExp
import com.kunishu.model.user._
import com.kunishu.storage.{CondBuilder, StorageQueries, Storage}
import com.kunishu.storage.conversion.StorageConversions._
import com.kunishu.users.io.UserRepo
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.commons.MongoDBObject
import com.kunishu.model.user.UserAttrs._

/**
 * Storage for keeping information about users
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UserStorage extends Storage[AnyUser] with UserRepo with StorageQueries with CondBuilder
with UserFilters with RegExp {

  override def isLoginFree(eMail: String): Boolean = {
    val userByMail = MongoDBObject(attEMail -> eMail)
    val mailOnly = MongoDBObject(attEMail -> true)
    repo.
      find(userByMail, mailOnly).
      isEmpty
  }

  def get(id: String): Option[AnyUser] = {
    repo.
      findOne(queryById(id), without(attPassword)).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap)).
      map(map => Users.asUser(map))
  }

  override def find(criteria: SearchUserCriteria): Seq[AnyUser] = {
    val userCriteria = scala.collection.mutable.ListBuffer[DBObject]()
    addCriteria(userCriteria, criteria.roles, List(attRole))
    addCriteria(userCriteria, criteria.nameParts, List(attFirstName, attLastName, attEMail))
    addCriteria(userCriteria, criteria.locationParts, List(
      subAttribute(attLocations, attName),
      subAttribute(attLocations, attAddress, attStreet),
      subAttribute(attLocations, attAddress, attCity),
      subAttribute(attLocations, attAddress, attCountry)
    ))
    addCriteria(userCriteria, criteria.specializations, List(subAttribute(attLocations, attSpecializations)))

    repo.
      find(andCondition(userCriteria), without(attPassword)).
      skip(criteria.startIndex).
      limit(criteria.count).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap)).
      map(map => Users.asUser(map)).
      map(u => filterLocation(location2Address)(u, multiMatch(criteria.locationParts))).
      map(u => filterLocation(locationToSpecializations)(u, multiMatch(criteria.specializations))).
      toSeq
  }

}
