package com.kunishu.web.service

import akka.actor.{Actor, ActorLogging}
import akka.event.LoggingReceive
import com.kunishu.model.user.Users
import com.kunishu.services.config.ServiceProvider.securityService
import com.kunishu.services.security.AuthenticationService
import com.kunishu.services.security.AuthenticationService._
import com.kunishu.web.monit.HealthCheckWebService
import com.kunishu.web.parsing.StorageModelParser.toJson
import spray.http.StatusCodes
import spray.routing.RequestContext

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent._

/**
 * Controller responsible for logging in and out users
 *
 * @author Michal Wronski
 * @since 1.0
 */
class SecurityWebService(requestContext: RequestContext) extends Actor with ActorLogging with CaptchaGateway with HealthCheckWebService {

  override def receive = LoggingReceive {

    healthCheck(securityService, requestContext) orElse {

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

}
