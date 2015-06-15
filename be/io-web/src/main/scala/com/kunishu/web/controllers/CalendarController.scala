package com.kunishu.web.controllers

import akka.actor.{ActorLogging, Actor}
import akka.event.LoggingReceive
import com.kunishu.core.processing.Result
import com.kunishu.services.chronos.CalendarService._
import com.kunishu.model.EntityAttrs
import com.kunishu.model.calendar.Visit
import spray.routing.RequestContext
import spray.http.{StatusCodes}
import com.kunishu.web.parsing.StorageModelParser._;
import com.kunishu.services.config.ServiceProvider.calendarService
import com.kunishu.core.processing._

/**
 * Controller for handling calendar related requests
 * @param requestContext
 */
class CalendarController(requestContext: RequestContext) extends Actor with ActorLogging {


  override def receive = LoggingReceive {

    case GetVisit(visitId, user) => calendarService ! GetVisit(visitId, user)

    case GetVisitResponse(response: Result[Visit]) => {
      response match {
        case Success(visit) => requestContext.complete(toJson(visit))
        case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
        case NotFoundError(errorMsg) => requestContext.complete(StatusCodes.NotFound, errorMsg)
        case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
      }
    }

    case GetVisits(owner, start, end, user, asDoctor) => calendarService ! GetVisits(owner, start, end, user, asDoctor)

    case GetVisitsResponse(response: Result[Seq[Visit]]) => {
      response match {
        case Success(visits) => requestContext.complete(toJson(visits))
        case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
        case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
      }
    }

    case UpdateVisit(visit, user) => calendarService ! UpdateVisit(visit, user)

    case UpdateVisitResponse(response) => {
      response match {
        case Success(result) => requestContext.complete(StatusCodes.NoContent, "")
        case ValidationError(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
        case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
        case NotFoundError(errorMsg) => requestContext.complete(StatusCodes.NotFound, errorMsg)
        case Fault(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
        case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
      }
    }

    case CreateVisit(visit, user) => calendarService ! CreateVisit(visit, user)

    case CreateVisitResponse(response) => {
      response match {
        case Success(newVisitId) => requestContext.complete(StatusCodes.OK, toJson(Map(EntityAttrs.attId -> newVisitId)))
        case ValidationError(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
        case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
        case NotFoundError(errorMsg) => requestContext.complete(StatusCodes.NotFound, errorMsg)
        case Fault(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
        case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
      }
    }

    case SearchDoctors(criteria, user) => calendarService ! SearchDoctors(criteria, user)

    case SearchDoctorsResponse(response) => {
      response match {
        case Success(doctors) => requestContext.complete(StatusCodes.OK, toJson(doctors))
        case ValidationError(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
        case UnauthorizedError(errorMsg) => requestContext.complete(StatusCodes.Unauthorized, errorMsg)
        case NotFoundError(errorMsg) => requestContext.complete(StatusCodes.NotFound, errorMsg)
        case Fault(errorMsg) => requestContext.complete(StatusCodes.BadRequest, errorMsg)
        case _ => requestContext.complete(StatusCodes.BadRequest, "Unknown error")
      }
    }

  }

}
