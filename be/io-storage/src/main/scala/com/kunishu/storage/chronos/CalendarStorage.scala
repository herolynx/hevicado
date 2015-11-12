package com.kunishu.storage.chronos

import com.kunishu.chronos.io.CalendarRepo
import com.kunishu.model.user.{Location, AnyUser}
import com.kunishu.storage.conversion.StorageConversions._
import com.mongodb.casbah.Imports._
import com.kunishu.model.calendar.Visit
import com.kunishu.storage.{StorageQueries, Storage}
import org.joda.time.DateTime
import com.kunishu.model.calendar.VisitAttrs._
import scala.collection.mutable.ListBuffer
import com.mongodb.casbah.commons.MongoDBObject

/**
 * Storage managing calendar visits
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait CalendarStorage extends Storage[Visit] with CalendarRepo with StorageQueries {

  override def get(id: String): Option[Visit] = segment("getById") {
    findOne(repo, id).
      map(objMap => new Visit(objMap))
  }

  override def getPatientVisits(userId: String, start: DateTime, end: DateTime): Seq[Visit] = segment("getPatientVisits") {
    val queryPatientVisits = MongoDBObject(subAttribute(attPatient, attId) -> asId(userId)) ++ (attStart $gte start) ++ (attEnd $lte end)
    find(repo, queryPatientVisits).
      map(map => new Visit(map)).
      toSeq
  }

  override def getDoctorVisits(userId: String, start: DateTime, end: DateTime): Seq[Visit] = segment("getDoctorVisits") {
    val queryDoctorVisits = MongoDBObject(subAttribute(attDoctor, attId) -> asId(userId)) ++ (attStart $gte start) ++ (attEnd $lte end)
    find(repo, queryDoctorVisits).
      map(map => new Visit(map)).
      toSeq
  }

  override def isDoctorTimeWindowFree(userId: String, start: DateTime, end: DateTime): Boolean = segment("isDoctorTimeWindowFree") {
    val timeWindow = $and(
      MongoDBObject(
        subAttribute(attDoctor, attId) -> asId(userId)),
      (attCancelled $exists false),
      $or(
        $and((attStart $gte start), (attEnd $lte end)),
        $and((attStart $gte start), (attStart $lt end)),
        $and((attEnd $gt start), (attEnd $lte end)),
        $and((attStart $lte start), (attEnd $gte end))
      )
    )

    find(repo, timeWindow).
      map(map => new Visit(map)).
      isEmpty
  }

  override def getDoctorsVisits(usersIds: List[String], start: DateTime, end: DateTime): Map[String, Seq[Visit]] = segment("getDoctorsVisits") {
    val queryDoctorVisits = $and(
      (subAttribute(attDoctor, attId) $in usersIds.map(id => asId(id))),
      (attStart $gte start),
      (attEnd $lte end)
    )
    val results = scala.collection.mutable.Map[String, ListBuffer[Visit]]()
    for (visit <- find(repo, queryDoctorVisits).map(map => new Visit(map))) {
      results.getOrElseUpdate(visit.doctor.id.get, ListBuffer[Visit]()) += visit
    }
    results.
      mapValues(visits => visits.toList).
      toMap
  }

  override def updatePatientInfo(user: AnyUser, start: DateTime): Boolean = segment("updatePatientInfo") {
    val queryPatientVisits = $and(
      MongoDBObject(subAttribute(attPatient, attId) -> asId(user.id.get)),
      (attCancelled $exists false),
      (attStart $gte start)
    )
    repo.update(
      queryPatientVisits,
      $set(attPatient -> denormalize(user.attributes)),
      upsert = false,
      multi = true
    ).
      getN >= 1
  }

  override def updateDoctorInfo(doctor: AnyUser, start: DateTime): Boolean = segment("updateDoctorInfo") {
    val queryDoctorVisits = $and(
      MongoDBObject(subAttribute(attDoctor, attId) -> asId(doctor.id.get)),
      (attCancelled $exists false),
      (attStart $gte start)
    )
    repo.update(
      queryDoctorVisits,
      $set(attDoctor -> denormalize(doctor.attributes)),
      upsert = false,
      multi = true
    ).
      getN >= 1
  }

  override def updateLocationInfo(doctorId: String, location: Location, start: DateTime): Boolean = segment("updateLocationInfo") {
    val queryDoctorVisits = $and(
      MongoDBObject(subAttribute(attDoctor, attId) -> asId(doctorId)),
      MongoDBObject(subAttribute(attLocation, attId) -> asId(location.id.get)),
      (attCancelled $exists false),
      (attStart $gte start)
    )
    repo.update(
      queryDoctorVisits,
      $set(attLocation -> denormalize(location.attributes)),
      upsert = false,
      multi = true
    ).
      getN >= 1
  }
}
