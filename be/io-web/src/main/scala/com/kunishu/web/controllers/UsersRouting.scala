package com.kunishu.web.controllers

import akka.actor.{Props, ActorRef}
import com.kunishu.model.user.{UsersCriteria, SearchUserCriteria, AnyUser, User}
import com.kunishu.services.users.UserService._
import spray.http.{HttpCharsets, MediaTypes}
import spray.routing.{RequestContext, HttpService}
import com.kunishu.web.parsing.StorageModelParser.fromJson

/**
 * Routing rules for users module
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UsersRouting extends HttpService {

  private def prepareActor(ctx: RequestContext): ActorRef = {
    actorRefFactory.actorOf(Props(classOf[UsersController], ctx))
  }

  /**
   * Users public routing rules
   */
  private[web] def usersPublicRoute = {
    path("user") {
      post {
        requestInstance { req =>
          val userAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            prepareActor(ctx) ! Register(new User(userAttrs))
          }
        }
      }
    }
  }

  /**
   * Users private routing rules
   * @param user user accessing service
   * @return chain directive
   */
  private[web] def usersAuthRoute(user: AnyUser) = {
    path("user") {
      get {
        parameters('text) { (text) =>
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            prepareActor(ctx) ! FindUsers(new SearchUserCriteria(Map(UsersCriteria.attName -> text)), user)
          }
        }
      }
    } ~
      path("user" / Segment) { userId =>
        get {
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            prepareActor(ctx) ! GetUser(userId, user)
          }
        }
      } ~
      path("user") {
        put {
          requestInstance { req =>
            val userAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              prepareActor(ctx) ! UpdateAccount(new User(userAttrs), user)
            }
          }
        }
      }
  }

}
