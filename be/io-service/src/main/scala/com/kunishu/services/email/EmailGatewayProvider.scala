package com.kunishu.services.email

import com.kunishu.model.messages.{AnyEmail, EmailGateway}
import com.kunishu.services.InterService
import com.kunishu.services.config.ServiceProvider._
import com.kunishu.services.users.UserService.{GetUserResponse, GetUser}

import scala.concurrent.Future

/**
 * Gateway providing access to e-mail messaging
 *
 * @author Michal Wronski
 * @since 1.1
 */
class EmailGatewayProvider extends InterService with EmailGateway {

  override def send(eMail: AnyEmail): Future[Boolean] =
    sendMsg(eMailService, eMail).
      mapTo[Boolean]

}
