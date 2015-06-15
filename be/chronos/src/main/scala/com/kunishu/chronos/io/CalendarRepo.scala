package com.kunishu.chronos.io

import com.kunishu.model.calendar.Visit
import com.kunishu.model.user.{Location, AnyUser, Doctor}
import org.joda.time.DateTime

/**
 * Repository for calendar related data
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait CalendarRepo {

  /**
   * Create new visit
   * @param v visit to be created
   * @return ID of newly created visit
   */
  def create(v: Visit): String

  /**
   * Update visit
   * @param v visit to be updated
   * @return update status
   */
  def update(v: Visit): Boolean

  /**
   * Get visit
   * @param id visit ID
   * @return non-nullable optional visit
   */
  def get(id: String): Option[Visit]

  /**
   * Get patient visit
   * @param userId user who is a patient
   * @param start start time
   * @param end end time
   * @return non-nullable results
   */
  def getPatientVisits(userId: String, start: DateTime, end: DateTime): Seq[Visit]

  /**
   * Get doctor's visit
   * @param userId user who is a doctor
   * @param start start time
   * @param end end time
   * @return non-nullable results
   */
  def getDoctorVisits(userId: String, start: DateTime, end: DateTime): Seq[Visit]

  /**
   * Check whether doctor doesn't have any events during specified time
   * @param userId user who is a doctor
   * @param start start time
   * @param end end time
   * @return true if time window is free, false otherwise
   */
  def isDoctorTimeWindowFree(userId: String, start: DateTime, end: DateTime): Boolean

  /**
   * Get doctors; visit
   * @param usersIds doctors who's visits should be taken
   * @param start start time
   * @param end end time
   * @return non-nullable results
   */
  def getDoctorsVisits(usersIds: List[String], start: DateTime, end: DateTime): Map[String, Seq[Visit]]

  /**
   * Update info about doctor in visits
   * @param doctor new doctor info
   * @param start start time after which visits should be updated
   * @return update status
   */
  def updateDoctorInfo(doctor: AnyUser, start: DateTime): Boolean

  /**
   * Update info about patients in visits
   * @param user new user info
   * @param start start time after which visits should be updated
   * @return update status
   */
  def updatePatientInfo(user: AnyUser, start: DateTime): Boolean

  /**
   * Update info about location in visits
   * @param doctorId doctor who owns the visits
   * @param location changed location
   * @param start start time after which visits should be updated
   * @return update status
   */
  def updateLocationInfo(doctorId: String, location: Location, start: DateTime): Boolean

}
