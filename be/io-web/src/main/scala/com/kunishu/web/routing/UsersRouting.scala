package com.kunishu.web.routing

import com.kunishu.model.user.{AnyUser, SearchUserCriteria, User, UsersCriteria}
import com.kunishu.services.users.UserService._
import com.kunishu.web.parsing.StorageModelParser.fromJson
import com.kunishu.web.service.WebServices._
import spray.http.{HttpCharsets, MediaTypes}
import spray.routing.HttpService
import kamon.spray.KamonTraceDirectives.traceName

/**
 * Routing rules for users module
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UsersRouting extends HttpService {

  /**
   * Users public routing rules
   */
  private[web] def usersPublicRoute = {
    path("user") {
      post {
        traceName("registerUser") {
          requestInstance { req =>
            val userAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              users(actorRefFactory, ctx) ! Register(new User(userAttrs))
            }
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
        traceName("findUsers") {
          parameters('text) { (text) =>
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              users(actorRefFactory, ctx) ! FindUsers(new SearchUserCriteria(Map(UsersCriteria.attName -> text)), user)
            }
          }
        }
      }
    } ~
      path("user" / Segment) { userId =>
        get {
          traceName("getUser") {
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              users(actorRefFactory, ctx) ! GetUser(userId, user)
            }
          }
        }
      } ~
      path("user") {
        put {
          traceName("updateUserAccount") {
            requestInstance { req =>
              val userAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
              respondWithMediaType(MediaTypes.`application/json`) { ctx =>
                users(actorRefFactory, ctx) ! UpdateAccount(new User(userAttrs), user)
              }
            }
          }
        }
      }
  }

}
