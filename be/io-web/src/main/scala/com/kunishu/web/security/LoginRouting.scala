package com.kunishu.web.security

import akka.actor.{Props, ActorRef}
import com.kunishu.model.user.User
import com.kunishu.services.security.AuthenticationService
import com.kunishu.web.parsing.StorageModelParser._
import spray.http.{HttpCharsets, MediaTypes}
import spray.routing.{RequestContext, HttpService}
import AuthenticationService._

/**
 * Routing rules for login related stuff
 * @author Michal Wronski
 */
trait LoginRouting extends HttpService {

  private def prepareActor(ctx: RequestContext): ActorRef = {
    actorRefFactory.actorOf(Props(classOf[LoginController], ctx))
  }

  private[web] def loginRoute = {
    path("login") {
      post {
        formFields('login, 'password) { (login, password) =>
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            prepareActor(ctx) ! Login(login, password)
          }
        }
      }
    }
  }

  private[web] def lostPassword = {
    path("lost-password") {
      post {
        requestInstance { req =>
          val userAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            prepareActor(ctx) ! LostPassword(new User(userAttrs))
          }
        }
      }
    }
  }

  private[web] def logoutRoute = {
    path("logout" / Segment) { token =>
      post {
        respondWithMediaType(MediaTypes.`application/json`) { ctx =>
          prepareActor(ctx) ! Logout(token)
        }
      }
    }
  }

}