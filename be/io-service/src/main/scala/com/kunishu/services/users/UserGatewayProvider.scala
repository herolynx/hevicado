package com.kunishu.services.users

import com.kunishu.chronos.io.UserGateway
import com.kunishu.core.processing.Result
import com.kunishu.model.user.{AnyUser, SearchUserCriteria}
import com.kunishu.services.InterService
import com.kunishu.services.config.ServiceProvider

import scala.concurrent.Future
import ServiceProvider.userService
import UserService._
import scala.concurrent._
import ExecutionContext.Implicits.global

/**
 * Gateway providing access to user data
 *
 * @author Michal Wronski
 * @since
 */
sealed class UserGatewayProvider extends InterService with UserGateway {

  override def getUser(userId: String, user: AnyUser): Future[Result[AnyUser]] =
    sendMsg(userService, GetUser(userId, user)).
      mapTo[GetUserResponse].
      map(response => response.result)

  override def findDoctors(criteria: SearchUserCriteria, user: AnyUser): Future[Result[Seq[AnyUser]]] =
    sendMsg(userService, FindUsers(criteria, user)).
      mapTo[FindUsersResponse].
      map(response => response.result)

}
