package com.kunishu.model.security

import java.util.UUID

import com.kunishu.core.security.Encryption
import com.kunishu.model.Entity
import com.kunishu.model.user.{AnyUser, Users}
import org.joda.time.DateTime

import scala.util.Random

object AccessPassAttrs {

  val attUser = "user"
  val attExpiryDate = "expiryDate"
  val attToken = "token"
  val attPassword = "password"

}

object AccessPass {

  import AccessPassAttrs._

  /**
   * Create new access token for a user
   * @param user authenticated user
   * @param expiryDate token expiry date
   * @return non-nullable access token
   */
  def createToken(user: AnyUser, expiryDate: DateTime = new DateTime().plusDays(5)): Token =
    new Token(
      Map(
        attToken -> Encryption.hash(UUID.randomUUID().toString),
        attExpiryDate -> expiryDate,
        attUser -> user.attributes.filterNot(_._1.equals(attPassword))
      )
    )

  /**
   * Create new temporary password for one time access
   * @param user user who wants to regain access to his account
   * @param length length of password to be generated
   * @param expiryDate password expiry date
   * @return generated temp password and temp access pass
   */
  def createTmpPassword(user: AnyUser, length: Int = 30, expiryDate: DateTime = new DateTime().plusHours(1)): (String, TempPassword) = {
    val tmpPassword = Random.alphanumeric.take(length).mkString
    (
      tmpPassword,
      new TempPassword(
        Map(
          attPassword -> Encryption.hash(tmpPassword),
          attExpiryDate -> expiryDate,
          attUser -> user.attributes.filterNot(_._1.equals(attPassword))
        )
      )
      )
  }

  /**
   * Create proper access pass based on attributes definition
   * @param map access pass map
   * @return new instance of proper access pass
   */
  def create(map: Map[String, Any]): AccessPass = {
    if (map.contains(attPassword)) {
      TempPassword(map)
    } else {
      Token(map)
    }
  }

}


/**
 * Access pass for an user to system
 *
 * @param map access attributes
 * @author Michal Wronski
 * @since 1.1
 */
abstract class AccessPass(map: Map[String, Any]) extends Entity {

  import AccessPassAttrs._

  /**
   * Get user authenticated by given pass
   * @return non-nullable user
   */
  final def user: AnyUser = map.
    get(attUser).
    map(value => value.asInstanceOf[Map[String, Any]]).
    map(map => Users.asUser(map)).
    get

  /**
   * Get expiration date of access pass
   * @return non-nullable date
   */
  final def expiryDate: DateTime = map.
    get(attExpiryDate).
    get.
    asInstanceOf[DateTime]

  /**
   * Check whether access pass is still valid
   * @return true if pass is valid, false otherwise
   */
  final def isValid = new DateTime().isBefore(expiryDate)

}


/**
 * Access token
 * @param map access attributes
 */
sealed case class Token(map: Map[String, Any]) extends AccessPass(map) {

  import AccessPassAttrs.attToken

  /**
   * Get token ID
   * @return non-nullable token
   */
  def token: String = map.
    get(attToken).
    map(_.toString).
    get

}


/**
 * Temporary password for one time access
 * @param map access attributes
 */
sealed case class TempPassword(map: Map[String, Any]) extends AccessPass(map) {

  import AccessPassAttrs.attPassword

  /**
   * Get one time access password
   * @return non-nullable password
   */
  def password: String = map.
    get(attPassword).
    map(_.toString).
    get

}