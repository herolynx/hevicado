package com.kunishu.services.config

import com.typesafe.config.ConfigFactory

/**
 * Configuration provider
 *
 * @author Michal Wronski
 * @since 1.3
 */
object ConfigProvider {

  val config = ConfigFactory.load()

}
