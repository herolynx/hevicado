package com.kunishu.security.io

import com.kunishu.model.security.AccessPass
import com.kunishu.model.user.AnyUser

/**
 * Repository for manging authentication related stuff
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait AuthenticationRepo {

  /**
   * Find user by login
   * @param login user's login (e-mail)
   * @return non-nullable option
   */
  def findUserByLogin(login: String): Option[AnyUser]

  /**
   * Find user by ID
   * @param id user's ID
   * @return non-nullable option
   */
  def findUserById(id: String): Option[AnyUser]

  /**
   * Create access pass for authenticated user
   * @param pass access pass
   * @return ID of newly created token
   */
  def create(pass: AccessPass): String

  /**
   * Update access pass for authenticated user
   * @param pass updated access pass
   * @return update result
   */
  def update(pass: AccessPass): Boolean

  /**
   * Delete access pass and invalidate user assigned to it
   * @param id ID of access pass
   */
  def delete(id: String)

  /**
   * Find user assigned to token
   * @param token user's token
   * @return non-nullable option
   */
  def findByToken(token: String): Option[AccessPass]

  /**
   * Find all access pass assigned to user
   * @param login user's login/e-mail
   * @return non-nullable sequence
   */
  def findByLogin(login: String): Seq[AccessPass]

  /**
   * Find all access pass assigned to user
   * @param id user's ID
   * @return non-nullable sequence
   */
  def findByUserId(id: String): Seq[AccessPass]

}
