package com.kunishu.security.logic

import com.kunishu.core.monit.Instrumented
import com.kunishu.model.security.AccessPass
import com.kunishu.model.user.AnyUser
import com.kunishu.security.io.AuthenticationRepo

/**
 * Module for authenticating and managing tokens
 *
 * @author Michal Wronski
 * @since 1.1
 */
trait TokenAuthentication extends Instrumented {

  import com.kunishu.model.security.AccessPassAttrs._

  protected val authRepo: AuthenticationRepo

  /**
   * Get user assigned to given token
   * @param token token assigned to some user
   * @return non-nullable option
   */
  def authToken(token: String): Option[AnyUser] = segment("authToken") {
    authRepo.
      findByToken(token).
      filter(_.isValid).
      map(_.user)
  }

  /**
   * Invalidate token
   * @param token token to be invalidated
   */
  def invalidateToken(token: String) = segment("invalidateToken") {
    authRepo.
      findByToken(token).
      map(pass => authRepo.delete(pass.id.get))
  }

  /**
   * Create token pass for authenticated user
   * @param user user that has been authenticated
   * @return non-nullable token pass
   */
  def createToken(user: AnyUser) = segment("createToken") {
    val tokenPass = AccessPass.createToken(user)
    authRepo.create(tokenPass)
    tokenPass
  }

  /**
   * Update info about user in valid tokens
   * @param updatedUser updated user info
   * @return true if info has been updated, false otherwise
   */
  def updateUserInfo(updatedUser: AnyUser): Boolean = segment("updateTokenUserInfo") {
    val user = authRepo.findUserById(updatedUser.id.get).get
    authRepo
      .findByUserId(updatedUser.id.get)
      .filter(_.isValid)
      .map(
        pass => {
          val updatedPass = AccessPass.create(pass.attributes ++ Map(attUser -> user.attributes.filterNot(_._1.equals(attPassword))))
          authRepo.update(updatedPass.asInstanceOf[AccessPass])
        }
      )
      .filter(_ == true)
      .nonEmpty
  }

}
