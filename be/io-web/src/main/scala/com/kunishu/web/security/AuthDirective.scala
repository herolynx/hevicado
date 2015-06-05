package com.kunishu.web.security

import com.kunishu.model.user.{AnyUser}
import spray.http.StatusCodes
import spray.routing._
import com.kunishu.services.config.ServiceProvider.authService

/**
 * Directive for authenticate in-coming requests
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait AuthDirective extends HttpService {

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
