package com.kunishu.users.logic

import com.kunishu.core.monit.Instrumented
import com.kunishu.core.processing.{NotFoundError, UnauthorizedError, Success, Result}
import com.kunishu.model.user.UserValidator._
import com.kunishu.model.user.{SearchUserCriteria, Doctor, User, AnyUser}
import com.kunishu.users.io.UserRepo

/**
 * Use cases related with accessing user accounts (getting, search etc.)
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UserAccess extends Instrumented {

  protected val userRepo: UserRepo

  /**
   * Find users by specified criteria
   * @param criteria search criteria
   * @param user user doing search
   * @return non-nullable result
   */
  def findUsers(criteria: SearchUserCriteria, user: AnyUser): Result[Seq[AnyUser]] = segment("findUsers") {
    val showProperInfo = (u: AnyUser) => if (criteria.contactInfoOnly) new User(u.attributes).info() else u.info()
    val showProperUsers = (u: AnyUser) => if (!user.isInstanceOf[Doctor]) u.isInstanceOf[Doctor] else true
    Success(
      userRepo.
        find(criteria).
        filter(showProperUsers).
        map(showProperInfo)
    )
  }


  /**
   * Get user's account
   * @param id ID of account to be taken
   * @param user user accessing account
   * @return non-nullable result
   */
  def getUser(id: String, user: AnyUser): Result[AnyUser] = segment("getUser") {
    val foundUser = userRepo.get(id)

    var result: Result[AnyUser] = null
    foundUser match {
      case None => result = new NotFoundError[AnyUser]("User not found: " + id)

      case Some(userAccount) => {

        user match {
          case User(_) =>
            if (isOwner(userAccount.id.get, user).isSuccess()) {
              result = Success(userAccount)
            } else if (userAccount.isInstanceOf[Doctor]) {
              result = Success(userAccount.info())
            } else {
              result = UnauthorizedError[AnyUser]("No privileges to see user: " + id)
            }

          case Doctor(_) =>
            if (isOwner(userAccount.id.get, user).isSuccess()) {
              result = Success(userAccount)
            } else {
              result = Success(userAccount.info())
            }
        }

      }
    }
    result
  }

}
