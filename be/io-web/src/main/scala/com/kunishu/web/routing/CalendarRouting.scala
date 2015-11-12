package com.kunishu.web.routing

import com.kunishu.core.date.Date._
import com.kunishu.model.calendar.{SearchDoctorCriteria, Visit}
import com.kunishu.model.user.AnyUser
import com.kunishu.services.chronos.CalendarService._
import com.kunishu.web.parsing.StorageModelParser._
import com.kunishu.web.service.WebServices._
import kamon.spray.KamonTraceDirectives._
import spray.http._
import spray.routing._

/**
 * Routing rules for calendar module
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait CalendarRouting extends HttpService {

  /**
   * Calendar routing rules
   * @param user user accessing resource
   */
  private[web] def calendarRoute(user: AnyUser) = {
    path("calendar") {
      post {
        traceName("searchCalendarDoctors") {
          requestInstance { req =>
            val criteria = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              calendar(actorRefFactory, ctx) ! SearchDoctors(new SearchDoctorCriteria(criteria), user)
            }
          }
        }
      }
    } ~
      path("calendar" / Segment / "visit") { ownerId =>
        get {
          traceName("getVisits") {
            parameters('start, 'end, 'asDoctor) { (start, end, asDoctor) =>
              respondWithMediaType(MediaTypes.`application/json`) { ctx =>
                calendar(actorRefFactory, ctx) ! GetVisits(ownerId, toDate(start), toDate(end), user, asDoctor.toBoolean)
              }
            }
          }
        }
      } ~
      path("calendar" / "visit" / Segment) { visitId =>
        get {
          traceName("getVisit") {
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              calendar(actorRefFactory, ctx) ! GetVisit(visitId, user)
            }
          }
        }
      } ~
      path("calendar" / "visit") {
        post {
          traceName("createVisit") {
            requestInstance { req =>
              val visitAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
              respondWithMediaType(MediaTypes.`application/json`) { ctx =>
                calendar(actorRefFactory, ctx) ! CreateVisit(new Visit(visitAttrs), user)
              }
            }
          }
        } ~
          put {
            traceName("updateVisit") {
              requestInstance { req =>
                val visitAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
                respondWithMediaType(MediaTypes.`application/json`) { ctx =>
                  calendar(actorRefFactory, ctx) ! UpdateVisit(new Visit(visitAttrs), user)
                }
              }
            }
          }
      }
  }

}
