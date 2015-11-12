package com.kunishu.web.directives

import com.kunishu.model.user.AnyUser
import com.kunishu.services.config.ServiceProvider.authService
import com.typesafe.scalalogging.slf4j.LazyLogging
import spray.http.StatusCodes
import spray.routing._

/**
 * Directive for authenticate in-coming requests
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait AuthDirective extends HttpService with LazyLogging {

  protected val adminToken: String

  /**
   * Authenticate user based on his token
   * @param token token to be validated
   * @return optional authenticated user
   */
  def authenticate(token: String): Directive1[AnyUser] = {
    val authUser = authService.authToken(token)
    authUser match {
      case Some(user) => provide(user)
      case None => complete(StatusCodes.Unauthorized, "Invalid token: " + token)
    }
  }

}
