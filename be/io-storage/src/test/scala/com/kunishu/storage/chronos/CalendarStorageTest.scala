package com.kunishu.storage.chronos

import com.kunishu.model.EntityAttrs
import com.kunishu.model.calendar.Visit
import com.kunishu.storage.StorageTest
import com.kunishu.storage.test.TestDB
import com.kunishu.storage.test.data.TestDBCalendar
import com.kunishu.test.data.VisitTestData
import org.joda.time.{DateTimeZone, DateTime}
import org.scalatest.{Matchers, GivenWhenThen, FunSpec}
import com.kunishu.test.data.UsersTestData._

/**
 * Test cases related with keeping calendar related data
 *
 * @author Michal Wronski
 * @since 1.0
 */
class CalendarStorageTest extends FunSpec with GivenWhenThen with TestDB with TestDBCalendar with Matchers
with StorageTest[Visit]
with CalendarStorage {

  override val collectionName = "calendar"

  describe("Calendar storage") {

    describe("Getting visit") {

      it("Should get visit") {
        Given("visit exists")
        val visitId = "546b8fd1ef660df8426005c0"

        When("getting visit")
        val visit = get(visitId)

        Then("visit is found")
        visit.isDefined should be(true)
        And("visit has proper info")
        visit.get.patient.get.eMail should be(johnnyBravo.eMail)
        visit.get.doctor.eMail should be(zbigniewReliga.eMail)
        And("visit has proper dates")
        visit.get.start should be(new DateTime(2015, 1, 19, 8, 0, 0))
        visit.get.end should be(new DateTime(2015, 1, 19, 8, 30, 0))
      }

      it("Should not get  non-existing visit") {
        Given("visit doesn't exist")
        val visitId = "546b8fd1ef660df8426005a0"

        When("getting visit")
        val visit = get(visitId)

        Then("visit is not found")
        visit.isDefined should be(false)
      }

    }

    describe("Patient visits") {

      it("Should find patient visits") {
        Given("a user")
        val user = johnnyBravo
        And("chosen time period")
        val start = new DateTime(2015, 1, 19, 7, 0, 0)
        val end = new DateTime(2015, 1, 19, 9, 0, 0)

        When("getting patient visits")
        val visits = getPatientVisits(user.id.get, start, end)

        Then("proper visits are returned")
        visits.size should be(3)
        visits(0).id.get should be("546b8fd1ef660df8426005c0")
        visits(1).id.get should be("546b8fd1ef660df842600ac0")
        visits(2).id.get should be("546b8fd1ef660df8426005e0")
      }

    }

    describe("Doctor visits") {

      it("Should find doctor visits") {
        Given("a doctor")
        val user = zbigniewReliga
        And("chosen time period")
        val start = new DateTime(2015, 1, 19, 7, 0, 0)
        val end = new DateTime(2015, 1, 19, 9, 0, 0)

        When("getting doctor visits")
        val visits = getDoctorVisits(user.id.get, start, end)

        Then("proper visits are returned")
        visits.size should be(3)
        visits(0).id.get should be("546b8fd1ef660df8426005c0")
        visits(1).id.get should be("546b8fd1ef660df842600ac0")
        visits(2).id.get should be("546b8fd1ef660df8426005c1")
      }

      it("Should find doctors visits") {
        Given("a doctors")
        val doctorsIds = List(zbigniewReliga.id.get, doctorQuin.id.get)
        And("chosen time period")
        val start = new DateTime(2015, 1, 19, 7, 0, 0)
        val end = new DateTime(2015, 1, 19, 9, 0, 0)

        When("getting doctors visits")
        val doctorsVisits = getDoctorsVisits(doctorsIds, start, end)

        Then("proper visits are returned")
        doctorsVisits.size should be(2)
        And("visits are grouped per doctor")
        val religaVisits = doctorsVisits.get(zbigniewReliga.id.get).get
        religaVisits.size should be(3)
        religaVisits(0).id.get should be("546b8fd1ef660df8426005c0")
        religaVisits(1).id.get should be("546b8fd1ef660df842600ac0")
        religaVisits(2).id.get should be("546b8fd1ef660df8426005c1")

        val quinVisits = doctorsVisits.get(doctorQuin.id.get).get
        quinVisits.size should be(2)
        quinVisits(0).id.get should be("546b8fd1ef660df8426005e0")
        quinVisits(1).id.get should be("546b8fd1ef660df8426005e1")
      }

    }

    describe("Checking doctor's time window") {

      it("Should verify time window embracing other event") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period embraces other event")
        val start = new DateTime(2015, 1, 19, 7, 55, 0)
        val end = new DateTime(2015, 1, 19, 8, 35, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as not free")
        isTimeWindowFree should be(false)
      }

      it("Should verify time window in exact time of other event") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period is exactly in duration of other event")
        val start = new DateTime(2015, 1, 19, 8, 0, 0)
        val end = new DateTime(2015, 1, 19, 8, 30, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as not free")
        isTimeWindowFree should be(false)
      }

      it("Should verify time window inner other event") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period in other event duration")
        val start = new DateTime(2015, 1, 19, 8, 10, 0)
        val end = new DateTime(2015, 1, 19, 8, 20, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as not free")
        isTimeWindowFree should be(false)
      }

      it("Should verify time window that overlaps beginning of other event") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period overlaps beginning of other event")
        val start = new DateTime(2015, 1, 19, 7, 50, 0)
        val end = new DateTime(2015, 1, 19, 8, 10, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as not free")
        isTimeWindowFree should be(false)
      }

      it("Should verify time window that overlaps end of other event") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period overlaps end of other event")
        val start = new DateTime(2015, 1, 19, 8, 20, 0)
        val end = new DateTime(2015, 1, 19, 8, 40, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as not free")
        isTimeWindowFree should be(false)
      }

      it("Should verify free time window") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period is free")
        val start = new DateTime(2015, 1, 19, 9, 15, 0)
        val end = new DateTime(2015, 1, 19, 9, 45, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as free")
        isTimeWindowFree should be(true)
      }

      it("Should verify free time window as the end of other event") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period is free")
        And("time period starts when other event ends")
        val start = new DateTime(2015, 1, 19, 9, 0, 0)
        val end = new DateTime(2015, 1, 19, 9, 30, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as free")
        isTimeWindowFree should be(true)
      }

      it("Should verify free time window during cancelled event") {
        Given("a doctor")
        val user = zbigniewReliga
        And("time period is during cancelled event")
        val start = new DateTime(2015, 1, 19, 15, 0, 0)
        val end = new DateTime(2015, 1, 19, 15, 30, 0)

        When("checking doctor's time window")
        val isTimeWindowFree = isDoctorTimeWindowFree(user.id.get, start, end)

        Then("time window is shown as free")
        isTimeWindowFree should be(true)
      }

    }

  }

  def testEntity: Visit = VisitTestData.sampleVisit()

  override def modifyEntity(entity: Visit, id: String, attributes: Map[String, Any]): Visit =
    new Visit(
      entity.attributes ++ attributes ++ Map(EntityAttrs.attId -> id)
    )
}
