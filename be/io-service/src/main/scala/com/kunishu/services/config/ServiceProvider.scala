package com.kunishu.services.config

import akka.actor.{ActorRef, Props, ActorSystem}
import akka.routing.{BroadcastGroup}
import com.kunishu.security.logic.{TokenAuthentication, UserAuthentication}
import com.kunishu.services.chronos.CalendarService
import com.kunishu.services.config.RepoProvider._
import com.kunishu.services.email.{EmailGatewayProvider, EmailService}
import com.kunishu.services.security.AuthenticationService
import com.kunishu.services.users.{UserGatewayProvider, UserService}
import ConfigProvider.config

/**
 * Service configuration
 *
 * @author Michal Wronski
 * @since 1.0
 */
object ServiceProvider {

  private val serviceConfig = config.getConfig("service")

  val system = ActorSystem(serviceConfig.getString("system"), config)

  /**
   * Service for sending e-mail messages
   * @return new instance
   */
  def eMailService = system.actorOf(Props(classOf[EmailService]))

  /**
   * Service responsible for users
   * @return new instance
   */
  def userService = system.actorOf(Props(classOf[UserService], userRepo, broadcastUsers))

  /**
   * Service responsible for calendar management
   * @return new instance
   */
  def calendarService = system.actorOf(Props(classOf[CalendarService], calendarRepo, new UserGatewayProvider(), new EmailGatewayProvider()))

  /**
   * Service responsible for security aspects
   * @return new instance
   */
  def securityService = system.actorOf(Props(classOf[AuthenticationService], securedRepo, new EmailGatewayProvider()))

  /**
   * Service for authentication only
   * @return new instance
   */
  def authService = new Object with UserAuthentication with TokenAuthentication {
    protected override val authRepo = securedRepo
    protected override val eMailGateway = new EmailGatewayProvider()
  }

  /**
   * Broadcast group related with user related changes
   */
  val broadcastUsers: ActorRef = ServiceProvider.system.actorOf(BroadcastGroup(List(
    calendarService.path.toString,
    securityService.path.toString
  )).props(), serviceConfig.getString("broadcast.users"))

}
