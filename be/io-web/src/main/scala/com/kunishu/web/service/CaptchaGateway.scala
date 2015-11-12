package com.kunishu.web.service

import com.kunishu.core.monit.Instrumented
import com.kunishu.model.Entity
import com.kunishu.services.config.ConfigProvider._
import com.kunishu.web.generic.HttpClient
import com.kunishu.web.parsing.StorageModelParser.fromJson
import com.typesafe.scalalogging.slf4j.LazyLogging
import spray.http._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, _}

object CaptchaGateway {

  def apply() = new CaptchaGateway {}

}

/**
 * Gateway for providing captcha support
 *
 * @author Michal Wronski
 * @since 1.1
 */
trait CaptchaGateway extends Instrumented {

  private val captchaConfig = config.getConfig("captcha")
  private val captchaKey = captchaConfig.getString("private-key")
  private val captchaUrl = captchaConfig.getString("verification-url")
  private val captchaAtt = captchaConfig.getString("response-att")

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
  def verifyCaptcha(captcha: Map[String, Any]): Future[Boolean] = futureSegment("verifyCaptcha") {
    sendVerificationReq(captcha.get("response").get.toString).
      map { response =>
      val status = fromJson(response.entity.asString(HttpCharsets.`UTF-8`))
      status.get("success").map(v => v.toString.toBoolean).getOrElse(false)
    }
  }

  /**
   * Verify captcha response
   * @param response response given by the user
   * @return future HTTP response
   */
  def sendVerificationReq(response: String) = HttpClient.get(captchaUrl.format(captchaKey, response))

}

/**
 * Captcha health-check capability
 *
 * @author Michal Wronski
 */
trait CaptchaHealthCheck extends LazyLogging {

  /**
   * Check whether checking of captcha is possible
   * @param ex current execution context
   * @return none if captcha is up, some with error message otherwise
   */
  final def captchaHealthCheck(implicit ex: ExecutionContext): Future[Option[String]] = {
    logger.debug("[Health-check] Checking captcha service")
    return CaptchaGateway()
      .sendVerificationReq("check")
      .map(
        httpResp =>
          httpResp.status match {
            case StatusCodes.OK => None

            case _ => Some(s"Captcha is not available, error: ${httpResp}")

          }
      )
  }

}