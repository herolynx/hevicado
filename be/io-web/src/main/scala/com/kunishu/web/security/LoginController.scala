package com.kunishu.web.security

import akka.actor.{ActorLogging, Actor}
import akka.event.LoggingReceive
import com.kunishu.model.user.Users
import com.kunishu.services.security.AuthenticationService
import AuthenticationService._
import spray.http.StatusCodes
import spray.routing.RequestContext
import com.kunishu.web.parsing.StorageModelParser.toJson
import com.kunishu.services.config.ServiceProvider._
import scala.concurrent._
import ExecutionContext.Implicits.global

/**
 * Controller responsible for logging in and out users
 *
 * @author Michal Wronski
 * @since 1.0
 */
class LoginController(requestContext: RequestContext) extends Actor with ActorLogging with CaptchaGateway {

  override def receive = LoggingReceive {

    case Login(login, password) => {
      securityService ! Login(login, password)
    }

    case LoginResp(accessPass) => {
      accessPass match {
        case Some(token) => requestContext.complete(toJson(token))
        case None => requestContext.complete(StatusCodes.Unauthorized, "Wrong login and/or password")
      }
    }

    case Logout(token) => {
      securityService ! Logout(token)
      requestContext.complete(StatusCodes.OK, "")
    }

    case LostPassword(user) => {
      verifyCaptcha(user).onComplete {
        case scala.util.Success(verification) =>
          verification match {
            case true => {
              securityService ! LostPassword(Users.asUser(user.attributes.filterKeys(filterNotCaptcha)))
              requestContext.complete(StatusCodes.OK, "")
            }
            case _ => requestContext.complete(StatusCodes.Unauthorized, "Captcha verification failed")
          }

        case scala.util.Failure(_) => requestContext.complete(StatusCodes.BadRequest, "Couldn't verify captcha")
      }
    }

  }

}
