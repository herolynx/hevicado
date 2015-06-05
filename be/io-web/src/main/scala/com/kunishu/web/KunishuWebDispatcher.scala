package com.kunishu.web

import akka.actor.{Actor}
import com.kunishu.services.config.ConfigProvider
import com.kunishu.web.security.{AuthDirective, LoginRouting}
import spray.routing._
import spray.http._
import com.kunishu.web.controllers.{UsersRouting, CalendarRouting}
import ConfigProvider._
import scala.util.{Failure, Success}


/**
 * Web application entry point
 */
class KunishuWebDispatcherActor extends Actor with KunishuWebDispatcher {
  def actorRefFactory = context

  override def receive = runRoute(publicRouting ~ authRouting)

}

/**
 * Main routing rules for the whole application
 */
trait KunishuWebDispatcher extends HttpService with CorsDirectives with AuthDirective
with CalendarRouting with LoginRouting with UsersRouting {

  private val allowedClients = List(config.getString("web.cors.allowed-clients"))

  /**
   * Routing rules available for all clients
   */
  lazy val publicRouting = {
    corsFilter(allowedClients) {
      genericRoute ~
        usersPublicRoute ~
        loginRoute ~
        lostPassword
    }
  }

  /**
   * Routing rules available only for authenticated clients
   */
  lazy val authRouting = {
    corsFilter(allowedClients) {
      headerValueByName("Authorization") { token =>
        authenticate(token) { user =>
          logoutRoute ~
            usersAuthRoute(user) ~
            calendarRoute(user)
        }
      }
    }
  }

  /**
   * Generic public routing rules
   */
  private lazy val genericRoute = {
    path("ping") {
      get {
        respondWithMediaType(MediaTypes.`text/plain`) {
          complete("pong")
        }
      } ~
        post {
          respondWithMediaType(MediaTypes.`text/plain`) {
            complete("pong (post)")
          }
        }
    }
  }


}