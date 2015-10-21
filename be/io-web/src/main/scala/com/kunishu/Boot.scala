package com.kunishu

import akka.actor.{Props}
import akka.io.IO
import com.kunishu.core.monit.Monitoring
import com.kunishu.services.config.ServiceProvider
import spray.can.Http
import com.kunishu.web.WebDispatcherActor
import com.kunishu.services.config.ConfigProvider._

object Boot extends App with HevicadoWeb with ServerStartup

trait HevicadoWeb {

  Monitoring.start
  implicit val system = ServiceProvider.system
  val webDispatcher = system.actorOf(Props[WebDispatcherActor], "kunishu-web-dispatcher")

}


trait ServerStartup {

  kunishuWeb: HevicadoWeb =>

  IO(Http) ! Http.Bind(
    webDispatcher,
    interface = config.getString("web.interface"),
    port = config.getString("web.port").toInt
  )

}
