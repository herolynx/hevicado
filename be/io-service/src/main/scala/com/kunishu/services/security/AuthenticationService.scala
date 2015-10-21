package com.kunishu.services.security

import akka.actor.{Actor, ActorLogging}
import akka.event.LoggingReceive
import com.kunishu.model.messages.EmailGateway
import com.kunishu.model.security.AccessPass
import com.kunishu.model.user.AnyUser
import com.kunishu.security.logic.{TokenAuthentication, UserAuthentication}
import com.kunishu.security.io.AuthenticationRepo
import com.kunishu.services.monit.ServiceHealthCheck
import com.kunishu.services.users.UserService.UserModifiedNotification

/**
 * Messages for the usage of authentication service
 */
object AuthenticationService {

  case class Auth(token: String)

  case class AuthResult(user: Option[AnyUser])

  case class Login(login: String, password: String)

  case class LoginResp(token: Option[AccessPass])

  case class Logout(token: String)

  case class LostPassword(user: AnyUser)

}

/**
 * Service responsible for authenticating users
 *
 * @author Michal Wronski
 * @since 1.0
 */
class AuthenticationService(repo: AuthenticationRepo, eMailService: EmailGateway) extends Actor with ActorLogging with ServiceHealthCheck
with UserAuthentication with TokenAuthentication {

  import com.kunishu.services.security.AuthenticationService._

  protected override val authRepo = repo
  protected val eMailGateway = eMailService

  override def receive = LoggingReceive {

    healthCheck orElse {

      case Auth(token) => {
        log.debug("Authenticating token: {}", token)
        sender() ! AuthResult(authToken(token))
      }

      case Login(login, password) => {
        log.debug("Loging user - login: {}", login)
        sender() ! LoginResp(authUser(login, password))
      }

      case Logout(token) => {
        log.debug("Invalidating token: {}", token)
        invalidateToken(token)
      }

      case LostPassword(user) => {
        log.debug("Regaining lost account of user: {}", user.eMail)
        regainAccount(user)
      }

      case UserModifiedNotification(user) => {
        log.debug("User has changed {} - updating existing tokens", user)
        updateUserInfo(user)
      }

    }

  }
}