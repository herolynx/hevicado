package com.kunishu.storage.monit

import com.kunishu.storage.users.UserStorage
import com.typesafe.scalalogging.slf4j.LazyLogging

import scala.concurrent.{Future, ExecutionContext}

/**
 * Storage health-check capability
 *
 * @author Michal Wronski
 */
trait StorageHealthCheck extends LazyLogging {

  userStorage: UserStorage =>

  /**
   * Check whether usage of simple storage is possible
   * @param ex current execution context
   * @return none if storage is up, some with error message otherwise
   */
  final def storageHealthCheck(implicit ex: ExecutionContext): Future[Option[String]] = Future {
    try {
      logger.debug("[Health-check] storage service")
      userStorage.isLoginFree("check")
      None
    }
    catch {
      case ex: Throwable => {
        Some(s"Storage is not available - error: ${ex}")
      }
    }
  }

}
