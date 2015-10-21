package com.kunishu.web.service

import akka.actor.{ActorLogging, Actor}
import akka.event.LoggingReceive
import com.kunishu.model.EntityAttrs
import com.kunishu.core.processing._
import com.kunishu.model.user.Users
import com.kunishu.services.users.UserService
import UserService._
import com.kunishu.web.monit.HealthCheckWebService
import com.kunishu.web.parsing.StorageModelParser._
import com.kunishu.web.service.CaptchaGateway
import spray.http.StatusCodes
import spray.routing.RequestContext
import com.kunishu.services.config.ServiceProvider.userService
import scala.concurrent._
import ExecutionContext.Implicits.global

/**
 * Controller for handling users related requests
 * @param requestContext
 * @author Michal Wronski
 * @since 1.0
 */
class UsersWebService(requestContext: RequestContext) extends Actor with ActorLogging with CaptchaGateway with HealthCheckWebService {

  override def receive = LoggingReceive {

    healthCheck(userService, requestContext) orElse {

      case Register(user) => {
        verifyCaptcha(user).onComplete {
          case scala.util.Success(verification) =>
            verification match {
              case true => userService ! Register(Users.asUser(user.attributes.filterKeys(filterNotCaptcha)))
              case _ => requestContext.complete(StatusCodes.Unauthorized, "Captcha verification failed")
            }

          case scala.util.Failure(_) => requestContext.complete(StatusCodes.BadRequest, "Couldn't verify captcha")
        }
      }

      case RegisterResponse(response) => {
        response match {
          case Success(newUserId) => requestContext.complete(StatusCodes.OK, toJson(Map(EntityAttrs.attId -> newUserId)))
          case ValidationError(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
          case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
        }
      }

      case FindUsers(criteria, user) => userService ! FindUsers(criteria, user)

      case FindUsersResponse(response) => {
        response match {
          case Success(users) => requestContext.complete(toJson(users))
          case ValidationError(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
          case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
          case NotFoundError(errorMsg) => requestContext.complete(StatusCodes.NotFound, errorMsg)
          case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
        }
      }

      case GetUser(id, user) => userService ! GetUser(id, user)

      case GetUserResponse(response) => {
        response match {
          case Success(user) => requestContext.complete(toJson(user))
          case ValidationError(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
          case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
          case NotFoundError(errorMsg) => requestContext.complete(StatusCodes.NotFound, errorMsg)
          case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
        }
      }

      case UpdateAccount(userToUpdate, user) => {
        userService ! UpdateAccount(userToUpdate, user)
      }

      case UpdateAccountResp(response) => {
        response match {
          case Success(result) => requestContext.complete(StatusCodes.NoContent, "")
          case ValidationError(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
          case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
          case NotFoundError(errorMsg) => requestContext.complete(StatusCodes.NotFound, errorMsg)
          case Fault(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
          case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
        }
      }
        
    }

  }

}
