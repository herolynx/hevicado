package com.kunishu.web.routing

import com.kunishu.model.user.User
import com.kunishu.services.security.AuthenticationService
import com.kunishu.services.security.AuthenticationService._
import com.kunishu.web.parsing.StorageModelParser._
import com.kunishu.web.service.WebServices.security
import kamon.spray.KamonTraceDirectives._
import spray.http.{HttpCharsets, MediaTypes}
import spray.routing.HttpService

/**
 * Routing rules for login related stuff
 * @author Michal Wronski
 */
trait SecurityRouting extends HttpService {

  private[web] def loginRoute = {
    path("login") {
      post {
        traceName("login") {
          formFields('login, 'password) { (login, password) =>
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              security(actorRefFactory, ctx) ! Login(login, password)
            }
          }
        }
      }
    }
  }

  private[web] def lostPassword = {
    path("lost-password") {
      post {
        traceName("lostPassword") {
          requestInstance { req =>
            val userAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              security(actorRefFactory, ctx) ! LostPassword(new User(userAttrs))
            }
          }
        }
      }
    }
  }

  private[web] def logoutRoute = {
    path("logout" / Segment) { token =>
      post {
        traceName("logout") {
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            security(actorRefFactory, ctx) ! Logout(token)
          }
        }
      }
    }
  }

}