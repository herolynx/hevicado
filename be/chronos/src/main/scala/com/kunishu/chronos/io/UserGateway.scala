package com.kunishu.chronos.io

import com.kunishu.core.processing.Result
import com.kunishu.model.user.{AnyUser, SearchUserCriteria, Doctor}

import scala.concurrent.Future

/**
 * Gate for retrieving users from external modules
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UserGateway {

  /**
   * Get user
   *
   * @param userId ID of account
   * @param user user accessing data
   * @return non-nullable future result
   */
  def getUser(userId: String, user: AnyUser): Future[Result[AnyUser]]

  /**
   * Find users by given criteria
   * @param criteria search criteria
   * @param user user accessing data
   * @return non-nullable future results
   */
  def findDoctors(criteria: SearchUserCriteria, user: AnyUser): Future[Result[Seq[AnyUser]]]


}
