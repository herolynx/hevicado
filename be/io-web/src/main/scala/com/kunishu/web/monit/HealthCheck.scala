package com.kunishu.web.monit

import com.kunishu.services.config.RepoProvider
import com.kunishu.services.email.{EmailHealthCheck}
import com.kunishu.services.monit.ServiceHealthCheck.HealthCheckReq
import com.kunishu.web.service.CaptchaHealthCheck
import com.typesafe.scalalogging.slf4j.LazyLogging
import kamon.spray.KamonTraceDirectives._
import spray.http.{StatusCodes, MediaTypes}
import spray.routing.{RequestContext, HttpService}

import scala.concurrent.ExecutionContext
import scala.util.{Try, Failure, Success}
import ExecutionContext.Implicits.global
import com.kunishu.web.service.WebServices._

private[monit] object HealthCheck {

  val rootPath = "health"

}

/**
 * Routing rules for heath-check of available services
 *
 * @author Michal Wronski
 */
trait HealthCheck extends HttpService with LazyLogging
with EmailHealthCheck with CaptchaHealthCheck {

  import HealthCheck._

  /**
   * Create health-check routing
   * @param token security access token
   * @return route
   */
  private[web] def healthCheckRoute(token: String) = {
    path(rootPath / token) {
      get {
        traceName("healthCheck") {
          respondWithMediaType(MediaTypes.`text/plain`) { ctx =>
            //generic check
            logger.debug("[Health-check] Checking web service")
            ctx.complete(StatusCodes.OK, "")
          }
        }
      }
    } ~
      path(rootPath / token / "repository") {
        get {
          traceName("healthCheckRepository") {
            respondWithMediaType(MediaTypes.`text/plain`) { ctx =>
              RepoProvider
                .healthCheck
                .storageHealthCheck
                .onComplete(handleHealthCheckStatus(ctx))
            }
          }
        }
      } ~
      path(rootPath / token / "mail") {
        get {
          traceName("healthCheckMail") {
            respondWithMediaType(MediaTypes.`text/plain`) { ctx =>
              emailHealthCheck
                .onComplete(handleHealthCheckStatus(ctx))
            }
          }
        }
      } ~
      path(rootPath / token / "captcha") {
        get {
          traceName("healthCheckCaptcha") {
            respondWithMediaType(MediaTypes.`text/plain`) { ctx =>
              captchaHealthCheck
                .onComplete(handleHealthCheckStatus(ctx))
            }
          }
        }
      } ~
      path(rootPath / token / "users") {
        get {
          traceName("healthCheckUsers") {
            respondWithMediaType(MediaTypes.`text/plain`) { ctx =>
              users(actorRefFactory, ctx) ! new HealthCheckReq
            }
          }
        }
      } ~
      path(rootPath / token / "calendar") {
        get {
          traceName("healthCheckCalendar") {
            respondWithMediaType(MediaTypes.`text/plain`) { ctx =>
              calendar(actorRefFactory, ctx) ! new HealthCheckReq
            }
          }
        }
      } ~
      path(rootPath / token / "security") {
        get {
          traceName("healthCheckSecurity") {
            respondWithMediaType(MediaTypes.`text/plain`) { ctx =>
              security(actorRefFactory, ctx) ! new HealthCheckReq
            }
          }
        }
      }
  }

  /**
   * Handle result of service health-check
   * @param ctx current request
   * @param result health check status (none-all ok, some-error)
   * @return nothing
   */
  private def handleHealthCheckStatus(ctx: RequestContext)(result: Try[Option[String]]) = result match {
    case Success(down) => {
      down match {

        case None => ctx.complete(StatusCodes.OK, "")

        case Some(msg) => {
          logger.error(s"[Health-check] Service is down - info: ${msg}")
          ctx.complete(StatusCodes.BadRequest, msg)
        }

      }
    }
    case Failure(ex) => {
      logger.error("[Health-check] Error occurred while checking service availability", ex)
      ctx.complete(StatusCodes.BadRequest, ex.getMessage)
    }
  }

}
