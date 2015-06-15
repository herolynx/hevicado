package com.kunishu.model.calendar

import com.kunishu.model.EntityAttrs._
import com.kunishu.model.calendar.VisitAttrs._
import com.kunishu.model.calendar.VisitValidator._
import com.kunishu.model.user._

object VisitConverter extends VisitConverter

/**
 * Visit converters
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait VisitConverter {

  /**
   * Show details of visit only to participants.
   * If user doesn't participate in a visit then only allowed information (i.e. about doctor's time table)
   * will be returned.
   * @param visit visit to be filtered
   * @param user user accessing visit
   * @return non-nullable option
   */
  def toParticipantVisit(visit: Visit, user: AnyUser): Option[Visit] = {
    if (userParticipates(visit, user)) {
      return Some(visit)
    } else {
      return toPublicVisit(visit)
    }
  }

  /**
   * Show only public attributes of visit
   * @param visit visit which attributes should be filtered out
   * @return non-nullable option
   */
  def toPublicVisit(visit: Visit): Option[Visit] = {
    import com.kunishu.model.calendar.VisitAttrs._
    if (visit.cancelled.isDefined) {
      return None
    } else {
      return Some(new Visit(
        Map(
          attStart -> visit.start,
          attEnd -> visit.end,
          attDoctor -> visit.doctor.attributes
        )
      ))
    }
  }

  /**
   * Filter attributes of visit to only those ones needed for cancellation
   * @param visit visit about to be cancelled
   * @return new instance of filtered visit
   */
  def toCancelVisit(visit: Visit) = new Visit(
    visit.attributes.filterKeys(att => Seq(attId, attCancelled).contains(att))
  )


}
