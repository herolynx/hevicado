package com.kunishu.services.users

import akka.actor.{ActorRef, Actor, ActorLogging}
import akka.event.LoggingReceive
import com.kunishu.core.processing.Result
import com.kunishu.model.user.{SearchUserCriteria, AnyUser}
import com.kunishu.services.monit.ServiceHealthCheck
import com.kunishu.users.logic.{UserAccess, UserAccount}
import com.kunishu.users.io.UserRepo

/**
 * Messages for user service usage
 *
 * @author Michal Wronski
 * @since 1.0
 */
object UserService {

  /**
   * Register user
   * @param user user account to be registered
   */
  case class Register(user: AnyUser)

  case class RegisterResponse(result: Result[String])

  /**
   * Get info about user
   * @param id user's ID
   * @param user user accessing data
   */
  case class GetUser(id: String, user: AnyUser)

  case class GetUserResponse(result: Result[AnyUser])

  /**
   * Find users
   * @param criteria search criteria
   * @param user user accessing data
   */
  case class FindUsers(criteria: SearchUserCriteria, user: AnyUser)

  case class FindUsersResponse(result: Result[Seq[AnyUser]])

  /**
   * Update user's account
   * @param userToUpdate user's account to be updated
   * @param user user accessing data
   */
  case class UpdateAccount(userToUpdate: AnyUser, user: AnyUser)

  case class UpdateAccountResp(result: Result[Boolean])

  /**
   * Info that user has been modified
   * @param changedUser user that has been changed
   */
  case class UserModifiedNotification(changedUser: AnyUser)

}

/**
 * Service managing users
 *
 * @author Michal Wronski
 * @since 1.0
 * @param repo user data provider
 * @param broadcast gateway for sending user related notifications
 */
class UserService(repo: UserRepo, broadcast: ActorRef) extends Actor with ActorLogging with ServiceHealthCheck
with UserAccount with UserAccess {

  protected override val userRepo = repo

  import com.kunishu.services.users.UserService._

  override def receive = LoggingReceive {

    healthCheck orElse {

      case Register(user) => {
        log.debug("Registering user: {}", user.eMail)
        sender() ! RegisterResponse(createAccount(user))
      }

      case FindUsers(criteria, user) => {
        log.debug("Searching users - current user: {}, criteria: {}", user.eMail, criteria)
        sender() ! FindUsersResponse(findUsers(criteria, user))
      }

      case GetUser(id, user) => {
        log.debug("Getting user - id: {}, current user: {}", id, user.eMail)
        sender() ! GetUserResponse(getUser(id, user))
      }

      case UpdateAccount(userToUpdate, user) => {
        log.debug("Updating user account - user to update: {}, current user: {}", userToUpdate.eMail, user.eMail)
        sender() ! UpdateAccountResp(updateAccount(userToUpdate, user))
        log.debug("User has been changed - broadcasting notification")
        broadcast ! UserModifiedNotification(userToUpdate)
      }

    }

  }

}
