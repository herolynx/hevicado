package com.kunishu.core.monit

import com.typesafe.scalalogging.slf4j.LazyLogging
import kamon.Kamon

/**
 * Monitoring capability
 *
 * @author Michal Wronski
 */
object Monitoring extends LazyLogging {

  def start = {
    logger.info("Starting monitoring")
    Kamon.start()
  }

}
