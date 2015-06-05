package com.kunishu.users.io

import com.kunishu.model.user.{SearchUserCriteria, AnyUser}

/**
 * Repository for keeping users' data
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UserRepo {

  /**
   * Check whether given e-mail is in usage
   * @param eMail user's login
   * @return true if e-mail is already used, false otherwise
   */
  def isLoginFree(eMail: String): Boolean;

  /**
   * Create new user
   * @param user user to be created
   * @return ID of newly created user
   */
  def create(user: AnyUser): String

  /**
   * Update user's account
   * @param user user to be updated
   * @return true if user was updated, false otherwise
   */
  def update(user: AnyUser): Boolean

  /**
   * Get user
   * @param id user ID
   * @return non-nullable option
   */
  def get(id: String): Option[AnyUser]

  /**
   * Find users
   * @param criteria search criteria
   * @return non-nullable results
   */
  def find(criteria: SearchUserCriteria): Seq[AnyUser]

}
