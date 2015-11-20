package com.kunishu.services.email

import java.util.Properties
import javax.mail._
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage

import akka.actor.ActorLogging
import com.kunishu.core.monit.Instrumented
import com.kunishu.services.config.ConfigProvider
import com.kunishu.services.config.ServiceProvider._
import ConfigProvider.config
import com.typesafe.scalalogging.slf4j.LazyLogging

object EmailSender {

  def apply() = new EmailSender {}

}

/**
  * E-mail sender
  *
  * @author Michal Wronski
  * @since 1.1
  */
trait EmailSender extends LazyLogging with Instrumented {

  private def mailConfig = {
    val mailConfig = config.getConfig("mail")
    val properties = new Properties()
    properties.setProperty("mail.smtp.host", mailConfig.getString("host"))
    properties.put("mail.smtp.port", mailConfig.getString("port"))
    properties.put("mail.smtp.auth", mailConfig.getString("auth"))
    properties.put("mail.smtp.starttls.enable", mailConfig.getString("tls-enable"))
    properties
  }

  private val session = Session.getDefaultInstance(
    mailConfig,
    new javax.mail.Authenticator() {
      override def getPasswordAuthentication: PasswordAuthentication = {
        val mailConfig = config.getConfig("mail")
        new PasswordAuthentication(mailConfig.getString("user"), mailConfig.getString("password"))
      }
    }
  )

  private def encoding = config.getConfig("mail.templates").getString("coding")

  def send(subject: String, body: String, toRecipients: List[String], from: String = "no_reply@hevicado.com"): Boolean = segment("sendEmail") {
    try {
      val message = new MimeMessage(session)
      message.setHeader("Content-Type", "text/html; charset=\"" + encoding + "\"")
      message.setSubject(subject, encoding)
      message.setText(body, encoding)

      message.setFrom(new InternetAddress(from))

      for (to <- toRecipients) {
        message.addRecipient(Message.RecipientType.TO, new InternetAddress(to))
      }

      Transport.send(message)
      true
    } catch {
      case e: Exception => {
        logger.error("Couldn't send e-mail", e)
        false
      }
    }
  }

}
