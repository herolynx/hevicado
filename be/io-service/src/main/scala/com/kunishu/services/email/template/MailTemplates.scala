package com.kunishu.services.email.template

import akka.actor.ActorLogging
import com.kunishu.model.calendar.Visit
import com.kunishu.model.messages.{VisitEmail, LostPasswordEmail}
import com.kunishu.core.date.Date._
import org.joda.time.{DateTime}
import com.kunishu.model.lang.Translate._

/**
 * Handler of e-mail templates
 *
 * @author Michal Wronski
 * @since 1.2
 */
trait MailTemplates extends TemplateProvider {

  logger: ActorLogging =>

  private def templateName(name: String, lang: String) =  name + "." + lang

  def lostPasswordTitle(lpe: LostPasswordEmail, lang: String = "en"): Option[String] =
    compileTemplate(templateName("lostPassword-title", lang), Map())

  def lostPasswordBody(lpe: LostPasswordEmail, lang: String = "en"): Option[String] =
    compileTemplate(templateName("lostPassword-body", lang), Map(
      "tempPass" -> lpe.tmpPassword
    ))

  def visitChangedTitle(ve: VisitEmail, lang: String = "en"): Option[String] =
    compileTemplate(templateName("visit-title", lang), Map(
      "startDate" -> prettyDateFormatter.print(toPatientTime(ve.visit, ve.visit.start))
    ))

  def visitChangedBody(ve: VisitEmail, lang: String = "en"): Option[String] =
    compileTemplate(templateName("visit-body", lang), Map(
      "title" -> translateVisitTitle(
        ve.visit.attributes.get("title").getOrElse("-").toString,
        ve.visit.patient.get.lang
      ),
      "startDate" -> prettyDateFormatter.print(toPatientTime(ve.visit, ve.visit.start)),
      "doctorDegree" -> translateDegree(
        ve.visit.doctor.attributes.get("degree").getOrElse("-").toString,
        ve.visit.patient.get.lang
      ),
      "doctorFirstName" -> ve.visit.doctor.attributes.get("first_name").getOrElse("-"),
      "doctorLastName" -> ve.visit.doctor.attributes.get("last_name").getOrElse("-"),
      "status" -> ve.visit.state
    ))


  private def toPatientTime(visit: Visit, date: DateTime): DateTime = date.withZone(visit.patient.get.timeZone)

}
