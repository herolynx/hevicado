package com.kunishu.services.email

import com.typesafe.scalalogging.slf4j.LazyLogging

import scala.concurrent.{ExecutionContext, Future}


/**
 * E-mail health-check capability
 *
 * @author Michal Wronski
 */
trait EmailHealthCheck extends LazyLogging {

  /**
   * Check whether sending of e-mails is possible
   * @param ex current execution context
   * @return none if e-mail is up, some with error message otherwise
   */
  final def emailHealthCheck(implicit ex: ExecutionContext): Future[Option[String]] = Future {
    try {
      logger.debug("[Health-check] Checking mail service")
      if (!EmailSender().send("Health-Check", "Health-Check message", List("any@hevicado.com"))) {
        Some("E-mail is not available - couldn't send sample mail")
      } else {
        None
      }
    }
    catch {
      case ex: Throwable => Some(s"E-mail is not available due to error - ${ex}")
    }
  }

}
