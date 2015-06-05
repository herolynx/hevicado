package com.kunishu.model.user

import com.kunishu.model.Entity
import org.joda.time.DateTimeZone

object Users {

  import UserAttrs._

  /**
   * Create user
   * @param map map with user attributes
   * @return non-nullable instance
   */
  def asUser(map: Map[String, _]): AnyUser = {
    val role = map.get(attRole).getOrElse("user")
    role match {
      case "user" => return new User(map)
      case "doctor" => return new Doctor(map)
    }
  }

  /**
   * Modify attributes of given user
   * @param user user to be modified
   * @param addAttrs new attributes to be added
   * @return new instance of user
   */
  def modifyUser(user: AnyUser, addAttrs: Map[String, Any]): AnyUser = {
    asUser(user.attributes ++ addAttrs)
  }

}

/**
 * Published attributes of doctor
 */
object UserAttrs {

  val attRole = "role"
  val attPassword = "password"
  val attFirstName = "first_name"
  val attLastName = "last_name"
  val attEMail = "email"
  val attLocations = "locations"
  val attSpecializations = "specializations"
  val attProfile = "profile"
  val attName = "name"
  val attAddress = "address"
  val attStreet = "street"
  val attCity = "city"
  val attCountry = "country"
  val attSettings = "profile"

  val roleUser = "user"
  val roleDoctor = "doctor"

}

/**
 * Any user of the application
 */
abstract class AnyUser extends Entity {

  import UserAttrs._

  lazy val eMail: String = map.get(attEMail).map(v => v.toString).getOrElse("")

  /**
   * Get public info about user
   * @return user with filtered attributes
   */
  def info(): AnyUser

  /**
   * Get settings of user profile
   * @return non-nullable map
   */
  final def settings: Map[String, Any] = attributes
    .get(attSettings)
    .getOrElse(Map[String, Any]())
    .asInstanceOf[Map[String, Any]]

  final def lang: String = settings.get("lang").getOrElse("pl").toString

  /**
   * Get offset of user's time zone in minutes
   * @return time zone offset
   */
  final def tzOffset: Int = settings.get("tzOffset").getOrElse(120).toString.toInt

  /**
   * Get user's time zone based on time zone offset
   * @return non-nullable time zone
   */
  final def timeZone: DateTimeZone = DateTimeZone.forOffsetHoursMinutes(tzOffset / 60, tzOffset % 60)

  /**
   * Check whether user wants to receive e-mail notifications
   * @return true if e-mail notifications is on, false otherwise
   */
  final def notifsEmail = settings.get("notifsEmail").getOrElse(true).toString.toBoolean

}

/**
 * Patient user
 * @param map user attributes
 */
sealed case class User(map: Map[String, Any]) extends AnyUser {

  import UserAttrs._

  override def info(): User = new User(map.filterKeys(att => !Seq(attProfile, attLocations).contains(att)))
}

/**
 * Doctor
 * @param map doctor attributes
 */
sealed case class Doctor(map: Map[String, Any]) extends AnyUser {

  import UserAttrs._

  override def info(): Doctor = new Doctor(map.filterKeys(att => !attProfile.equals(att)))

  lazy val locations: Seq[Location] = {
    map.
      get(attLocations).
      map(value => value.asInstanceOf[List[Map[String, Any]]]).
      map(locations => for (location <- locations) yield Location(location)).
      get
  }

}