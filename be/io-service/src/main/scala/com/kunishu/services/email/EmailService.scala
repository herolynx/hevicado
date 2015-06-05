package com.kunishu.services.email

import akka.actor.{ActorLogging, Actor}
import akka.event.LoggingReceive
import com.kunishu.model.messages.{VisitEmail, LostPasswordEmail}
import com.kunishu.services.email.template.MailTemplates

/**
 * Service for handling e-mail messaging
 *
 * @author Michal Wronski
 * @since 1.1
 */
class EmailService extends Actor with ActorLogging with EmailSender with MailTemplates {

  private val missingEmailBody = "This mail couldn't be generated. Please contact our help desk."

  override def receive = LoggingReceive {

    case lpe: LostPasswordEmail => {
      val eMailSent = send(
        lostPasswordTitle(lpe, lpe.user.lang).getOrElse("Lost password"),
        lostPasswordBody(lpe, lpe.user.lang).getOrElse(missingEmailBody),
        List(lpe.user.eMail)
      )
      log.debug("Lost password e-mail - user: {}, e-mail sent: {}", lpe.user.eMail, eMailSent)
      sender() ! eMailSent
    }

    case ve: VisitEmail => {
      var eMailSent = true
      if (ve.visit.patient.get.notifsEmail) {
        eMailSent = send(
          visitChangedTitle(ve, ve.visit.patient.get.lang).getOrElse("Visit changed"),
          visitChangedBody(ve, ve.visit.patient.get.lang).getOrElse(missingEmailBody),
          List(ve.visit.patient.get.eMail)
        )
        log.debug("Visit changed e-mail - user: {}, e-mail sent: {}", ve.visit.patient.get.eMail, eMailSent)
      }
      sender() ! eMailSent
    }

  }

}
