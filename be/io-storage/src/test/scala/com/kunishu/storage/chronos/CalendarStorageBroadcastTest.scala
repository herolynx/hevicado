package com.kunishu.storage.chronos

import com.kunishu.model.EntityAttrs
import com.kunishu.model.calendar.Visit
import com.kunishu.model.user.{Location, Doctor, User}
import com.kunishu.storage.StorageTest
import com.kunishu.storage.test.{TestDBSetUp, TestDB}
import com.kunishu.test.data.UsersTestData._
import com.kunishu.test.data.{LocationTestData, VisitTestData}
import com.kunishu.test.data.VisitTestData._
import org.joda.time.DateTime
import org.scalatest.{FunSpec, GivenWhenThen, Matchers}
import com.kunishu.model.user.UserAttrs._

/**
 * Test cases related with handling broadcast messages in scope of calendar related data
 *
 * @author Michal Wronski
 * @since 1.2
 */
class CalendarStorageBroadcastTest extends FunSpec with GivenWhenThen with TestDB with TestDBSetUp with Matchers
with StorageTest[Visit]
with CalendarStorage {

  override val collectionName = "calendar-broadcast"

  val visits = List(
    pulsantisVisit(new DateTime(2015, 3, 26, 8, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005e0"),
    pulsantisVisit(new DateTime(), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005e1"),
    pulsantisVisit(new DateTime().plusMinutes(60), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005e2"),
    cancelVisit(pulsantisVisit(new DateTime().plusMinutes(90), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005e3"))
  )

  override def initData() = {
    initCollection(collectionName, visits)
  }

  describe("Handling calendar storage broadcast notifications") {

    describe("Patient visits") {

      it("Should update patient info in open visits") {
        Given("any patient")
        var user = johnnyBravo
        And("patient has visits in the past")
        And("patient has visits in the future")
        And("user has been modified")
        user = new User(johnnyBravo.attributes ++ Map(attEMail -> "big.johnny@kunishu.com"))

        When("updating patient info in the future visits")
        updatePatientInfo(user, new DateTime())

        Then("patient info is updated in open visits")
        val patientVisits = getPatientVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
        patientVisits.size should be(4)
        patientVisits(2).id.get should be("546b8fd1ef660df8426005e2")
        patientVisits(2).patient.get.eMail should be("big.johnny@kunishu.com")
        And("other data of open visit is not changed")
        patientVisits(2).doctor.attributes should equal(new User(zbigniewReliga.attributes).info().attributes)
        patientVisits(2).start should be(visits(2).start)
        patientVisits(2).end should be(visits(2).end)
        patientVisits(2).location.name should be(LocationTestData.pulsantis().name)
      }

      it("Should not update patient info in closed visits") {
        Given("any patient")
        var user = johnnyBravo
        And("patient has visits in the past")
        And("patient has visits in the future")
        And("user has been modified")
        user = new User(johnnyBravo.attributes ++ Map(attEMail -> "big.johnny@kunishu.com"))

        When("updating patient info in the future visits")
        updatePatientInfo(user, new DateTime())

        Then("patient info is not updated in closed visits")
        val patientVisits = getPatientVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
        patientVisits(0).id.get should be("546b8fd1ef660df8426005e0")
        patientVisits(0).patient.get.eMail should be(johnnyBravo.eMail)
        patientVisits(1).id.get should be("546b8fd1ef660df8426005e1")
        patientVisits(1).patient.get.eMail should be(johnnyBravo.eMail)
        And("closed visit data is not touched")
        patientVisits(0).doctor.attributes should equal(new User(zbigniewReliga.attributes).info().attributes)
        patientVisits(0).start should be(new DateTime(2015, 3, 26, 8, 0, 0))
        patientVisits(0).end should be(new DateTime(2015, 3, 26, 8, 30, 0))
        patientVisits(0).location.name should be(LocationTestData.pulsantis().name)
      }

      it("Should not update patient info in cancelled visits") {
        Given("any patient")
        var user = johnnyBravo
        And("patient has visits in the past")
        And("patient has visits in the future")
        And("user has been modified")
        user = new User(johnnyBravo.attributes ++ Map(attEMail -> "big.johnny@kunishu.com"))

        When("updating patient info in the future visits")
        updatePatientInfo(user, new DateTime())

        Then("patient info is not updated in cancelled visits")
        val patientVisits = getPatientVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
        patientVisits(3).id.get should be("546b8fd1ef660df8426005e3")
        patientVisits(3).patient.get.eMail should be(johnnyBravo.eMail)
        And("cancelled visit data is not touched")
        patientVisits(3).start should be(visits(3).start)
        patientVisits(3).end should be(visits(3).end)
        patientVisits(3).location.name should be(LocationTestData.pulsantis().name)
      }

    }

    describe("Doctor visits") {

      it("Should update doctor info in visits") {
        Given("any doctor")
        var user = zbigniewReliga
        And("doctor has visits in the past")
        And("doctor has visits in the future")
        And("doctor has been modified")
        user = new Doctor(zbigniewReliga.attributes ++ Map(attEMail -> "prof.religa@kunishu.com"))

        When("updating doctor info in the open visits")
        updateDoctorInfo(user, new DateTime())

        Then("doctor info is updated in open visits")
        val doctorVisits = getDoctorVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
        doctorVisits.size should be(4)
        doctorVisits(3).id.get should be("546b8fd1ef660df8426005e2")
        doctorVisits(3).doctor.eMail should be("prof.religa@kunishu.com")
        And("other data of open visit is not changed")
        doctorVisits(3).patient.get should equal(johnnyBravo)
        doctorVisits(3).start should be(visits(2).start)
        doctorVisits(3).end should be(visits(2).end)
        doctorVisits(3).location.name should be(LocationTestData.pulsantis().name)
      }

      it("Should not update doctor info in closed visits") {
        Given("any doctor")
        var user = zbigniewReliga
        And("doctor has visits in the past")
        And("doctor has visits in the future")
        And("doctor has been modified")
        user = new Doctor(zbigniewReliga.attributes ++ Map(attEMail -> "prof.religa@kunishu.com"))

        When("updating doctor info in the open visits")
        updateDoctorInfo(user, new DateTime())

        Then("doctor info is not updated in closed visits")
        val doctorVisits = getDoctorVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
        doctorVisits(0).id.get should be("546b8fd1ef660df8426005e0")
        doctorVisits(0).doctor.eMail should be(zbigniewReliga.eMail)
        doctorVisits(1).id.get should be("546b8fd1ef660df8426005e1")
        doctorVisits(1).doctor.eMail should be(zbigniewReliga.eMail)
        And("closed visit data is not touched")
        doctorVisits(0).patient.get should equal(johnnyBravo)
        doctorVisits(0).start should be(new DateTime(2015, 3, 26, 8, 0, 0))
        doctorVisits(0).end should be(new DateTime(2015, 3, 26, 8, 30, 0))
        doctorVisits(0).location.name should be(LocationTestData.pulsantis().name)
      }

      it("Should not update doctor info in cancelled visits") {
        Given("any doctor")
        var user = zbigniewReliga
        And("doctor has visits in the past")
        And("doctor has visits in the future")
        And("doctor has been modified")
        user = new Doctor(zbigniewReliga.attributes ++ Map(attEMail -> "prof.religa@kunishu.com"))

        When("updating doctor info in the open visits")
        updateDoctorInfo(user, new DateTime())

        Then("doctor info is not updated in cancelled visits")
        val doctorVisits = getDoctorVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
        doctorVisits(2).id.get should be("546b8fd1ef660df8426005e3")
        doctorVisits(2).doctor.eMail should be(zbigniewReliga.eMail)
        doctorVisits(2).patient.get should equal(johnnyBravo)
        And("cancelled visit data is not touched")
        doctorVisits(2).start should be(visits(3).start)
        doctorVisits(2).end should be(visits(3).end)
        doctorVisits(2).location.name should be(LocationTestData.pulsantis().name)
      }

      describe("Locations in visits") {

        import LocationTestData._
        import com.kunishu.model.user.LocationAttrs.attrName

        it("Should update location in visits") {
          Given("any doctor")
          var user = zbigniewReliga
          And("doctor has visits in the past")
          And("doctor has visits in the future")
          And("doctor has been modified")
          val newPulsantis = new Location(pulsantis().attributes ++ Map(attrName -> "newPulsantis"))

          When("updating location info in the open visits")
          updateLocationInfo(user.id.get, newPulsantis.withoutTemplates, new DateTime())

          Then("location info is updated in open visits")
          val doctorVisits = getDoctorVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
          doctorVisits.size should be(4)
          doctorVisits(2).id.get should be("546b8fd1ef660df8426005e2")
          doctorVisits(2).location.name should be("newPulsantis")
          And("other data of open visit is not changed")
          doctorVisits(2).doctor.eMail should be(user.eMail)
          doctorVisits(2).patient.get should equal(johnnyBravo)
          doctorVisits(2).start should be(visits(2).start)
          doctorVisits(2).end should be(visits(2).end)
        }

        it("Should not update location in closed visits") {
          Given("any doctor")
          var user = zbigniewReliga
          And("doctor has visits in the past")
          And("doctor has visits in the future")
          And("doctor has been modified")
          val newPulsantis = new Location(pulsantis().attributes ++ Map(attrName -> "newPulsantis"))

          When("updating location info in the open visits")
          updateLocationInfo(user.id.get, newPulsantis.withoutTemplates, new DateTime())

          Then("location info is not updated in closed visits")
          val doctorVisits = getDoctorVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
          doctorVisits.size should be(4)
          doctorVisits(0).id.get should be("546b8fd1ef660df8426005e0")
          doctorVisits(0).location.name should be(pulsantis().name)
          doctorVisits(1).id.get should be("546b8fd1ef660df8426005e1")
          doctorVisits(1).location.name should be(pulsantis().name)
          And("closed visit data is not touched")
          doctorVisits(0).doctor.eMail should be(user.eMail)
          doctorVisits(0).patient.get should equal(johnnyBravo)
          doctorVisits(0).start should be(new DateTime(2015, 3, 26, 8, 0, 0))
          doctorVisits(0).end should be(new DateTime(2015, 3, 26, 8, 30, 0))
        }

        it("Should not update location in cancelled visits") {
          Given("any doctor")
          var user = zbigniewReliga
          And("doctor has visits in the past")
          And("doctor has visits in the future")
          And("doctor has been modified")
          val newPulsantis = new Location(pulsantis().attributes ++ Map(attrName -> "newPulsantis"))

          When("updating location info in the open visits")
          updateLocationInfo(user.id.get, newPulsantis.withoutTemplates, new DateTime())

          Then("location info is not updated in cancelled visits")
          val doctorVisits = getDoctorVisits(user.id.get, new DateTime(2015, 3, 26, 8, 0, 0), new DateTime().plusMinutes(120))
          doctorVisits.size should be(4)
          doctorVisits(3).id.get should be("546b8fd1ef660df8426005e3")
          doctorVisits(3).location.name should be(pulsantis().name)
          And("cancelled visit data is not touched")
          doctorVisits(3).doctor.eMail should be(user.eMail)
          doctorVisits(3).patient.get should equal(johnnyBravo)
          doctorVisits(3).start should be(visits(3).start)
          doctorVisits(3).end should be(visits(3).end)
        }


      }


    }

  }

  def testEntity: Visit = VisitTestData.sampleVisit()

  override def modifyEntity(entity: Visit, id: String, attributes: Map[String, Any]): Visit =
    new Visit(
      entity.attributes ++ attributes ++ Map(EntityAttrs.attId -> id)
    )
}
