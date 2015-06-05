package com.kunishu

import akka.actor.{Props}
import akka.io.IO
import com.kunishu.services.config.ServiceProvider
import spray.can.Http
import com.kunishu.web.KunishuWebDispatcherActor
import com.kunishu.services.config.ConfigProvider._

object Boot extends App with KunishuWeb with ServerStartup

trait KunishuWeb {

  implicit val system = ServiceProvider.system
  val webDispatcher = system.actorOf(Props[KunishuWebDispatcherActor], "kunishu-web-dispatcher")

}


trait ServerStartup {

  kunishuWeb: KunishuWeb =>

  IO(Http) ! Http.Bind(
    webDispatcher,
    interface = config.getString("web.interface"),
    port = config.getString("web.port").toInt
  )

}
