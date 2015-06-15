package com.kunishu.services.email

import java.util.Properties
import javax.mail._
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage

import akka.actor.ActorLogging
import com.kunishu.services.config.ConfigProvider
import com.kunishu.services.config.ServiceProvider._
import ConfigProvider.config

/**
 * E-mail sender
 *
 * @author Michal Wronski
 * @since 1.1
 */
trait EmailSender {

  logger: ActorLogging =>

  private def mailConfig = {
    val mailConfig = config.getConfig("mail")
    val properties = new Properties()
    properties.setProperty("mail.smtp.host", mailConfig.getString("host"))
    properties.put("mail.smtp.port", mailConfig.getString("port"))
    properties.put("mail.smtp.auth", mailConfig.getString("auth"))
    properties.put("mail.smtp.starttls.enable", mailConfig.getString("tls-enable"))
    properties
  }

  private val session = Session.getDefaultInstance(mailConfig)

  def send(subject: String, body: String, toRecipients: List[String], from: String = "no_reply@hevicado.com"): Boolean = {
    try {
      val message = new MimeMessage(session)
      message.setSubject(subject)
      message.setText(body)

      message.setFrom(new InternetAddress(from))

      for (to <- toRecipients) {
        message.addRecipient(Message.RecipientType.TO, new InternetAddress(to))
      }

      Transport.send(message)
      true
    } catch {
      case e: Exception => {
        logger.log.error(e, "Couldn't send e-mail")
        false
      }
    }
  }

}
