package com.kunishu.services

import akka.actor.ActorRef
import scala.concurrent.duration._
import akka.pattern.ask
import akka.util.Timeout
import com.kunishu.services.config.ConfigProvider


/**
 * Functionality related with service communication
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait InterService {

  private val maxTimeout = ConfigProvider.config.getString("service.max-timeout").toLong
  implicit val timeout = Timeout(maxTimeout, SECONDS)

  final def sendMsg(service: ActorRef, msg: AnyRef) = {
    service ? msg
  }

}
