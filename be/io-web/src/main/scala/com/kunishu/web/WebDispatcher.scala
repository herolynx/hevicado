package com.kunishu.web

import akka.actor.{Actor}
import com.kunishu.services.config.ConfigProvider
import com.kunishu.web.directives.{AuthDirective, CorsDirectives}
import com.kunishu.web.monit.HealthCheck
import com.kunishu.web.routing.{SecurityRouting, UsersRouting, CalendarRouting}
import spray.routing._
import ConfigProvider._


/**
 * Web application entry point
 */
class WebDispatcherActor extends Actor with WebDispatcher {

  def actorRefFactory = context

  override def receive = runRoute(adminRouting ~ publicRouting ~ authRouting)

  protected override val allowedClients = List(config.getString("web.cors.allowed-clients"))

  protected override val adminToken = config.getString("web.admin-token")

}

/**
 * Main routing rules for the whole application
 */
trait WebDispatcher extends HttpService with CorsDirectives with AuthDirective
with CalendarRouting with SecurityRouting with UsersRouting with HealthCheck {

  protected val allowedClients: List[String]
  protected val adminToken: String

  /**
   * Routing rules available for all clients
   */
  lazy val publicRouting = {
    corsFilter(allowedClients) {
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
   * Routing rules available only for admins
   */
  lazy val adminRouting = {
    corsFilter(allowedClients) {
      healthCheckRoute(adminToken)
    }
  }

}