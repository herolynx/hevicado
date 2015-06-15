package com.kunishu.model.messages

import scala.concurrent.Future

/**
 * Gateway for sending e-mails
 *
 * @author Michal Wronski
 * @since 1.1
 */
trait EmailGateway {

  def send(eMail: AnyEmail): Future[Boolean]

}
