package com.kunishu.model.messages

import com.kunishu.model.calendar.Visit
import com.kunishu.model.user.AnyUser

/**
 * Any e-mail that can be sent
 *
 * @param to receivers
 * @param cc CC receivers
 * @author Michal Wronski
 * @since 1.1
 */
abstract class AnyEmail(to: List[String], cc: Option[List[String]] = None)

/**
 * Single e-mail
 * @param subject title of the e-mail
 * @param body contect of the e-mail
 * @param to receivers
 * @param cc CC receivers
 */
case class Email(subject: String, body: String, to: List[String], cc: Option[List[String]] = None) extends AnyEmail(to, cc)

/**
 * E-email informing about lost password
 * @param tmpPassword one time access password that allows regaining control over account
 * @param user user who wants to regain control
 */
case class LostPasswordEmail(tmpPassword: String, user: AnyUser) extends AnyEmail(to = List(user.eMail))


/**
 * E-email informing about change in visit
 * @param visit visit that has been changed
 */
case class VisitEmail(visit: Visit) extends AnyEmail(to = List(visit.patient.get.eMail))