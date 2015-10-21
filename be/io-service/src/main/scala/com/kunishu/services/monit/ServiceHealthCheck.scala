package com.kunishu.services.monit

import akka.actor.{Actor}

object ServiceHealthCheck {

  class HealthCheckReq

  class HealthCheckResp

}

/**
 * Service health-check capability
 *
 * @author Michal Wronski
 */
trait ServiceHealthCheck extends Actor {

  import ServiceHealthCheck._

  final def healthCheck: akka.actor.Actor.Receive = {
    case req: HealthCheckReq => sender() ! new HealthCheckResp
  }

}
