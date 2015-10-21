package com.kunishu.web.service

import akka.actor.{ActorRefFactory, Props}
import com.kunishu.web.service.SecurityWebService
import spray.routing.RequestContext

/**
 * Provider of web services
 *
 * @author Michal Wronski
 */
object WebServices {

  def users(actorRefFactory: ActorRefFactory, ctx: RequestContext) = actorRefFactory.actorOf(Props(classOf[UsersWebService], ctx))

  def calendar(actorRefFactory: ActorRefFactory, ctx: RequestContext) = actorRefFactory.actorOf(Props(classOf[CalendarWebService], ctx))

  def security(actorRefFactory: ActorRefFactory, ctx: RequestContext) = actorRefFactory.actorOf(Props(classOf[SecurityWebService], ctx))

}
