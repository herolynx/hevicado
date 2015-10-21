package com.kunishu.web.monit

import akka.actor.{ActorRef, ActorLogging, Actor}
import com.kunishu.services.monit.ServiceHealthCheck.{HealthCheckResp, HealthCheckReq}
import spray.http.StatusCodes
import spray.routing.RequestContext

/**
 * Health-check capability for WEB layer of services
 *
 * @author Michal Wronski
 */
trait HealthCheckWebService extends Actor with ActorLogging {

  /**
   * Check availability of service
   * @param service service to be checked
   * @param requestContext current request context
   * @return health-check capability
   */
  final def healthCheck(service: ActorRef, requestContext: RequestContext): Receive = {

    case req: HealthCheckReq => service ! new HealthCheckReq

    case resp: HealthCheckResp => requestContext.complete(StatusCodes.OK, "")

  }


}
