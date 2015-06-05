package com.kunishu.web.security

import akka.actor.{ActorLogging, Actor}

import scala.concurrent.Future
import spray.http._
import spray.client.pipelining._
import com.kunishu.web.parsing.StorageModelParser.fromJson
import com.kunishu.model.Entity
import scala.concurrent._
import ExecutionContext.Implicits.global
import com.kunishu.services.config.ConfigProvider._


/**
 * Gateway for providing captcha support
 *
 * @author Michal Wronski
 * @since 1.1
 */
trait CaptchaGateway {

  this: Actor with ActorLogging =>

  val captchaConfig = config.getConfig("captcha")
  private val captchaKey = captchaConfig.getString("private-key")
  private val captchaUrl = captchaConfig.getString("verification-url")
  private val captchaAtt = captchaConfig.getString("response-att")

  /**
   * Function alias that provides HTTP types
   */
  private val pipeline: HttpRequest => Future[HttpResponse] = sendReceive

  /**
   * Filter out captcha related data
   * @return non-nullable filter
   */
  def filterNotCaptcha = (attr: String) => !captchaAtt.eq(attr)

  /**
   * Verify whether user response attached to entity
   * @param entity entity with captcha result
   * @return non-null verification result
   */
  def verifyCaptcha[T <: Entity](entity: T): Future[Boolean] =
    entity.
      attributes.
      get(captchaAtt).
      map(value => value.asInstanceOf[Map[String, Any]]).
      map(map => verifyCaptcha(map)).
      getOrElse(future(false))

  /**
   * Verify whether user response was correct
   * @param captcha captcha related information
   * @return non-null verification result
   */
  def verifyCaptcha(captcha: Map[String, Any]): Future[Boolean] = {
    pipeline(Get(captchaUrl.format(captchaKey, captcha.get("response").get.toString))).
      map { response =>
      val status = fromJson(response.entity.asString(HttpCharsets.`UTF-8`))
      status.get("success").map(v => v.toString.toBoolean).getOrElse(false)
    }
  }
}
