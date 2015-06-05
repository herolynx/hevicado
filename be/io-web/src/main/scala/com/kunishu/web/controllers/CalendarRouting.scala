package com.kunishu.web.controllers

import akka.actor.{ActorRef, Props, Actor}
import com.kunishu.core.date.Date._
import com.kunishu.model.calendar.{SearchDoctorCriteria, Visit}
import com.kunishu.model.user.AnyUser
import com.kunishu.services.chronos.CalendarService._
import com.kunishu.web.parsing.StorageModelParser._
import spray.routing._
import spray.http._
import spray.routing.RequestContext

/**
 * Routing rules for calendar module
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait CalendarRouting extends HttpService {

  private def prepareActor(ctx: RequestContext): ActorRef = {
    actorRefFactory.actorOf(Props(classOf[CalendarController], ctx))
  }

  /**
   * Calendar routing rules
   * @param user user accessing resource
   */
  private[web] def calendarRoute(user: AnyUser) = {
    path("calendar") {
      post {
        requestInstance { req =>
          val criteria = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            prepareActor(ctx) ! SearchDoctors(new SearchDoctorCriteria(criteria), user)
          }
        }
      }
    } ~
      path("calendar" / Segment / "visit") { ownerId =>
        get {
          parameters('start, 'end, 'asDoctor) { (start, end, asDoctor) =>
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              prepareActor(ctx) ! GetVisits(ownerId, toDate(start), toDate(end), user, asDoctor.toBoolean)
            }
          }
        }
      } ~
      path("calendar" / "visit" / Segment) { visitId =>
        get {
          respondWithMediaType(MediaTypes.`application/json`) { ctx =>
            prepareActor(ctx) ! GetVisit(visitId, user)
          }
        }
      } ~
      path("calendar" / "visit") {
        post {
          requestInstance { req =>
            val visitAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
            respondWithMediaType(MediaTypes.`application/json`) { ctx =>
              prepareActor(ctx) ! CreateVisit(new Visit(visitAttrs), user)
            }
          }
        } ~
          put {
            requestInstance { req =>
              val visitAttrs = fromJson(req.entity.asString(HttpCharsets.`UTF-8`))
              respondWithMediaType(MediaTypes.`application/json`) { ctx =>
                prepareActor(ctx) ! UpdateVisit(new Visit(visitAttrs), user)
              }
            }
          }
      }
  }

}
