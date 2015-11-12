package com.kunishu.storage.security

import com.kunishu.model.security.AccessPass
import com.kunishu.model.user.{Users, AnyUser}
import com.kunishu.security.io.AuthenticationRepo
import com.kunishu.storage.Storage
import com.kunishu.storage.conversion.StorageConversions._
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.commons.MongoDBObject
import com.kunishu.model.user.UserAttrs._

/**
 * Storage for keeping authentication stuff
 *
 * @author Michal Wronski
 * @since
 */
trait AuthStorage extends Storage[AccessPass] with AuthenticationRepo {

  protected val users: MongoCollection

  override def findUserById(id: String): Option[AnyUser] = segment("findUserById") {
    val queryById = MongoDBObject(attId -> asId(id))
    users.
      findOne(queryById).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap)).
      map(map => Users.asUser(map))
  }

  override def findUserByLogin(login: String): Option[AnyUser] = segment("findUserByLogin") {
    val queryByLogin = MongoDBObject(attEMail -> login)
    users.
      findOne(queryByLogin).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap)).
      map(map => Users.asUser(map))
  }

  override def findByToken(token: String): Option[AccessPass] = segment("findAccessPassByToken") {
    val tokenId = MongoDBObject("token" -> token)
    repo.
      findOne(tokenId).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap)).
      map(map => AccessPass.create(map))
  }

  override def findByLogin(login: String): Seq[AccessPass] = segment("findAccessPassByLogin") {
    val byUserLogin = MongoDBObject(subAttribute("user", attEMail) -> login)
    repo.
      find(byUserLogin).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap)).
      map(map => AccessPass.create(map)).
      toSeq
  }

  override def findByUserId(id: String): Seq[AccessPass] = segment("findAccessPassByUserId") {
    val byUserId = MongoDBObject(subAttribute("user", attId) -> asId(id))
    repo.
      find(byUserId).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap)).
      map(map => AccessPass.create(map)).
      toSeq
  }

}
