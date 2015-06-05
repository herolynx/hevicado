package com.kunishu.chronos.logic

import com.kunishu.chronos.io.{UserGateway, CalendarRepo}
import com.kunishu.core.processing.{Result, Success}
import com.kunishu.model.calendar.{Visit, SearchDoctorCriteria}
import com.kunishu.model.messages.EmailGateway
import com.kunishu.model.user.{Location, Doctor, AnyUser, SearchUserCriteria}
import com.kunishu.test.data.{VisitTestData, UsersTestData}
import org.joda.time.{Period, DateTime}
import org.scalamock.scalatest.MockFactory
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}

import scala.concurrent.{Await, Future, ExecutionContext, Promise}
import ExecutionContext.Implicits.global
import scala.concurrent.duration._
import VisitTestData._

/**
 * Unit tests checking async aspects of patient visits use cases
 *
 * @author Michal Wronski
 * @since 1.0
 */
class PatientVisitsAsyncTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest {

  trait SUT extends PatientVisits {
    override val calendarRepo = stub[CalendarRepo]
    override val userGateway = stub[UserGateway]
    override val eMailGateway = stub[EmailGateway]
  }

  val calendarRepoStub = new Object with CalendarRepo {

    override def create(v: Visit): String = "new-visit-id"

    override def update(v: Visit): Boolean = false

    override def getPatientVisits(userId: String, start: DateTime, end: DateTime): Seq[Visit] = List()

    override def get(id: String): Option[Visit] = None

    var doctorsVisitsResult: Map[String, Seq[Visit]] = Map()

    override def getDoctorsVisits(usersIds: List[String], start: DateTime, end: DateTime): Map[String, Seq[Visit]] = doctorsVisitsResult

    var doctorVisits: Seq[Visit] = List()

    override def getDoctorVisits(userId: String, start: DateTime, end: DateTime): Seq[Visit] = doctorVisits

    var timeWindowFree = false

    override def isDoctorTimeWindowFree(userId: String, start: DateTime, end: DateTime): Boolean = timeWindowFree

    override def updateDoctorInfo(doctor: AnyUser, start: DateTime): Boolean = true

    override def updatePatientInfo(user: AnyUser, start: DateTime): Boolean = true

    override def updateLocationInfo(doctorId: String, location: Location, start: DateTime): Boolean = true
  }

  val sut = new Object() with SUT {
    override val userGateway: UserGateway = stub[UserGateway]
    override val calendarRepo = calendarRepoStub
  }

  describe("Patient visits") {

    describe("Searching doctors") {

      it("Should find doctors") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen search criteria")
        val start = new DateTime(2015, 1, 19, 0, 0, 0)
        val end = new DateTime(2015, 1, 24, 0, 0, 0)
        val searchCriteria = new SearchDoctorCriteria(
          Map(
            "name" -> "zbi",
            "location" -> "Grabi",
            "start" -> start,
            "end" -> end,
            "specializations" -> List("spec1", "spec2")
          )
        )
        And("doctors visits are available")
        calendarRepoStub.doctorsVisitsResult = Map(
          UsersTestData.zbigniewReliga.id.get -> List(
            pulsantisVisit(new DateTime(2015, 1, 19, 8, 0, 0), 30),
            pulsantisVisit(new DateTime(2015, 1, 19, 8, 30, 0), 30),
            luxMedVisit(new DateTime(2015, 1, 21, 10, 0, 0), 45)
          )
        )
        And("doctors are available")
        val userPromise = Promise[Result[Seq[AnyUser]]]
        (sut.userGateway.findDoctors _) when(
          new SearchUserCriteria(searchCriteria.map, false),
          user
          ) returns (
          userPromise.future
          )

        When("searching doctors")
        userPromise.success(Success[Seq[AnyUser]](List(UsersTestData.zbigniewReliga)))
        val result = Await.result(sut.findDoctors(searchCriteria, user), 1000 millisecond)

        Then("results are received")
        result.isSuccess should be(true)
        And("proper doctors are found")
        val doctors = result.asInstanceOf[Success[Seq[Doctor]]].value
        doctors.size should be(1)
        val doctor = doctors.toList(0)
        doctor should not be (null)
        And("locations are present")
        doctor.locations.size should be(2)
        val location1 = doctor.locations(0)
        location1.name should be("Pulsantis")
        val location2 = doctor.locations(1)
        location2.name should be("LuxMed")
        And("calendar summary info is attached to locations")
        val calendar1 = location1.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar1.size should be(5)
        val calendar2 = location2.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar2.size should be(5)

        calendar1(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 60, "total" -> 240))
        calendar2(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 0, "total" -> 480))
        calendar2(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 45, "total" -> 480))

        calendar1(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
      }

      it("Should not include events in calendar outside of working hours") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen search criteria")
        val start = new DateTime(2015, 1, 19, 0, 0, 0)
        val end = new DateTime(2015, 1, 24, 0, 0, 0)
        val searchCriteria = new SearchDoctorCriteria(
          Map(
            "name" -> "zbi",
            "location" -> "Grabi",
            "start" -> start,
            "end" -> end,
            "specializations" -> List("spec1", "spec2")
          )
        )
        And("doctors visits are available")
        And("some visits are created not in working hours")
        calendarRepoStub.doctorsVisitsResult = Map(
          UsersTestData.zbigniewReliga.id.get -> List(
            pulsantisVisit(new DateTime(2015, 1, 19, 7, 30, 0), 30),
            pulsantisVisit(new DateTime(2015, 1, 19, 8, 00, 0), 30),
            luxMedVisit(new DateTime(2015, 1, 21, 8, 30, 0), 0),
            luxMedVisit(new DateTime(2015, 1, 21, 9, 0, 0), 45)
          )
        )
        And("doctors are available")
        val userPromise = Promise[Result[Seq[AnyUser]]]
        (sut.userGateway.findDoctors _) when(
          new SearchUserCriteria(searchCriteria.map, false),
          user
          ) returns (
          userPromise.future
          )

        When("searching doctors")
        userPromise.success(Success[Seq[AnyUser]](List(UsersTestData.zbigniewReliga)))
        val result = Await.result(sut.findDoctors(searchCriteria, user), 1000 millisecond)

        Then("results are received")
        result.isSuccess should be(true)
        And("proper doctors are found")
        val doctors = result.asInstanceOf[Success[Seq[Doctor]]].value
        doctors.size should be(1)
        val doctor = doctors.toList(0)
        doctor should not be (null)
        And("locations are present")
        doctor.locations.size should be(2)
        val location1 = doctor.locations(0)
        location1.name should be("Pulsantis")
        val location2 = doctor.locations(1)
        location2.name should be("LuxMed")
        And("calendar summary info is attached to locations")
        val calendar1 = location1.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar1.size should be(5)
        val calendar2 = location2.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar2.size should be(5)
        And("events outside of workings hours are not counted in calendar")
        calendar1(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 30, "total" -> 240))
        calendar2(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 45, "total" -> 480))
      }

      it("Should include events from different locations in working hours of a location") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen search criteria")
        val start = new DateTime(2015, 1, 19, 0, 0, 0)
        val end = new DateTime(2015, 1, 24, 0, 0, 0)
        val searchCriteria = new SearchDoctorCriteria(
          Map(
            "name" -> "zbi",
            "location" -> "Grabi",
            "start" -> start,
            "end" -> end,
            "specializations" -> List("spec1", "spec2")
          )
        )
        And("doctors visits are available")
        And("events from different locations are created in working hours of a location")
        calendarRepoStub.doctorsVisitsResult = Map(
          UsersTestData.zbigniewReliga.id.get -> List(
            pulsantisVisit(new DateTime(2015, 1, 19, 8, 00, 0), 30),
            luxMedVisit(new DateTime(2015, 1, 19, 8, 30, 0), 30),
            luxMedVisit(new DateTime(2015, 1, 21, 8, 30, 0), 0),
            luxMedVisit(new DateTime(2015, 1, 21, 9, 0, 0), 45)
          )
        )
        And("doctors are available")
        val userPromise = Promise[Result[Seq[AnyUser]]]
        (sut.userGateway.findDoctors _) when(
          new SearchUserCriteria(searchCriteria.map, false),
          user
          ) returns (
          userPromise.future
          )

        When("searching doctors")
        userPromise.success(Success[Seq[AnyUser]](List(UsersTestData.zbigniewReliga)))
        val result = Await.result(sut.findDoctors(searchCriteria, user), 1000 millisecond)
        Then("results are received")
        result.isSuccess should be(true)
        And("proper doctors are found")
        val doctors = result.asInstanceOf[Success[Seq[Doctor]]].value
        doctors.size should be(1)
        val doctor = doctors.toList(0)
        doctor should not be (null)
        And("locations are present")
        doctor.locations.size should be(2)
        val location1 = doctor.locations(0)
        location1.name should be("Pulsantis")
        val location2 = doctor.locations(1)
        location2.name should be("LuxMed")
        And("calendar summary info is attached to locations")
        val calendar1 = location1.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar1.size should be(5)
        val calendar2 = location2.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar2.size should be(5)
        And("events from different locations in working hours are included")
        calendar1(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 60, "total" -> 240))
        calendar2(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 45, "total" -> 480))
      }

      it("Should not include cancelled visits in summary calendar info in doctor search") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen search criteria")
        val start = new DateTime(2015, 1, 19, 0, 0, 0)
        val end = new DateTime(2015, 1, 24, 0, 0, 0)
        val searchCriteria = new SearchDoctorCriteria(
          Map(
            "name" -> "zbi",
            "location" -> "Grabi",
            "start" -> start,
            "end" -> end,
            "specializations" -> List("spec1", "spec2")
          )
        )
        And("doctors visits are available")
        And("some visits are cancelled")
        calendarRepoStub.doctorsVisitsResult = Map(
          UsersTestData.zbigniewReliga.id.get -> List(
            pulsantisVisit(new DateTime(2015, 1, 19, 8, 0, 0), 30),
            cancelVisit(pulsantisVisit(new DateTime(2015, 1, 19, 8, 30, 0), 30)),
            cancelVisit(pulsantisVisit(new DateTime(2015, 1, 19, 9, 0, 0), 30)),
            luxMedVisit(new DateTime(2015, 1, 21, 10, 0, 0), 45)
          )
        )
        And("doctors are available")
        val userPromise = Promise[Result[Seq[AnyUser]]]
        (sut.userGateway.findDoctors _) when(
          new SearchUserCriteria(searchCriteria.map, false),
          user
          ) returns (
          userPromise.future
          )

        When("searching doctors")
        userPromise.success(Success[Seq[AnyUser]](List(UsersTestData.zbigniewReliga)))
        val result = Await.result(sut.findDoctors(searchCriteria, user), 1000 millisecond)

        Then("results are received")
        result.isSuccess should be(true)
        And("proper doctors are found")
        val doctors = result.asInstanceOf[Success[Seq[Doctor]]].value
        doctors.size should be(1)
        val doctor = doctors.toList(0)
        doctor should not be (null)
        And("locations are present")
        doctor.locations.size should be(2)
        val location1 = doctor.locations(0)
        location1.name should be("Pulsantis")
        val location2 = doctor.locations(1)
        location2.name should be("LuxMed")
        And("calendar summary info is attached to locations")
        And("cancelled visits are not included")
        val calendar1 = location1.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar1.size should be(5)
        val calendar2 = location2.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar2.size should be(5)

        calendar1(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 30, "total" -> 240))
        calendar2(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 0, "total" -> 480))
        calendar2(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 45, "total" -> 480))

        calendar1(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
      }

      it("Should count partial times if events begin before or after working hours") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen search criteria")
        val start = new DateTime(2015, 1, 19, 0, 0, 0)
        val end = new DateTime(2015, 1, 24, 0, 0, 0)
        val searchCriteria = new SearchDoctorCriteria(
          Map(
            "name" -> "zbi",
            "location" -> "Grabi",
            "start" -> start,
            "end" -> end,
            "specializations" -> List("spec1", "spec2")
          )
        )
        And("doctors visits are available")
        And("some visits begins before or after working hours")
        calendarRepoStub.doctorsVisitsResult = Map(
          UsersTestData.zbigniewReliga.id.get -> List(
            pulsantisVisit(new DateTime(2015, 1, 19, 7, 30, 0), 60),
            pulsantisVisit(new DateTime(2015, 1, 20, 15, 30, 0), 60)
          )
        )
        And("doctors are available")
        val userPromise = Promise[Result[Seq[AnyUser]]]
        (sut.userGateway.findDoctors _) when(
          new SearchUserCriteria(searchCriteria.map, false),
          user
          ) returns (
          userPromise.future
          )

        When("searching doctors")
        userPromise.success(Success[Seq[AnyUser]](List(UsersTestData.zbigniewReliga)))
        val result = Await.result(sut.findDoctors(searchCriteria, user), 1000 millisecond)

        Then("results are received")
        result.isSuccess should be(true)
        And("proper doctors are found")
        val doctors = result.asInstanceOf[Success[Seq[Doctor]]].value
        doctors.size should be(1)
        val doctor = doctors.toList(0)
        doctor should not be (null)
        And("locations are present")
        doctor.locations.size should be(2)
        val location1 = doctor.locations(0)
        location1.name should be("Pulsantis")
        val location2 = doctor.locations(1)
        location2.name should be("LuxMed")
        And("calendar summary info is attached to locations")
        And("partial times are counted correctly")
        val calendar1 = location1.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar1.size should be(5)
        val calendar2 = location2.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar2.size should be(5)

        calendar1(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 30, "total" -> 240))
        calendar2(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 30, "total" -> 480))
        calendar2(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
      }

      it("Should gather calendar summary info for shifted time intervals") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen search criteria")
        And("beginning of the day is shifted one hour back")
        val start = new DateTime(2015, 1, 18, 23, 0, 0)
        val end = new DateTime(2015, 1, 23, 23, 0, 0)
        val searchCriteria = new SearchDoctorCriteria(
          Map(
            "name" -> "zbi",
            "location" -> "Grabi",
            "start" -> start,
            "end" -> end,
            "specializations" -> List("spec1", "spec2")
          )
        )
        And("doctors visits are available")
        And("some visits begins before or after working hours")
        calendarRepoStub.doctorsVisitsResult = Map(
          UsersTestData.zbigniewReliga.id.get -> List(
            pulsantisVisit(new DateTime(2015, 1, 19, 7, 30, 0), 60),
            pulsantisVisit(new DateTime(2015, 1, 20, 15, 30, 0), 60)
          )
        )
        And("doctors are available")
        val userPromise = Promise[Result[Seq[AnyUser]]]
        (sut.userGateway.findDoctors _) when(
          new SearchUserCriteria(searchCriteria.map, false),
          user
          ) returns (
          userPromise.future
          )

        When("searching doctors")
        userPromise.success(Success[Seq[AnyUser]](List(UsersTestData.zbigniewReliga)))
        val result = Await.result(sut.findDoctors(searchCriteria, user), 1000 millisecond)

        Then("results are received")
        result.isSuccess should be(true)
        And("proper doctors are found")
        val doctors = result.asInstanceOf[Success[Seq[Doctor]]].value
        doctors.size should be(1)
        val doctor = doctors.toList(0)
        doctor should not be (null)
        And("locations are present")
        doctor.locations.size should be(2)
        val location1 = doctor.locations(0)
        location1.name should be("Pulsantis")
        val location2 = doctor.locations(1)
        location2.name should be("LuxMed")
        And("calendar summary info is attached to locations")
        And("summary info is counted according to shifted day intervals")
        val calendar1 = location1.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar1.size should be(5)
        val calendar2 = location2.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar2.size should be(5)

        calendar1(0) should be(Map("period" -> "2015-01-18T23:00:00.000Z/2015-01-19T23:00:00.000Z", "occupied" -> 30, "total" -> 240))
        calendar2(0) should be(Map("period" -> "2015-01-18T23:00:00.000Z/2015-01-19T23:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(1) should be(Map("period" -> "2015-01-19T23:00:00.000Z/2015-01-20T23:00:00.000Z", "occupied" -> 30, "total" -> 480))
        calendar2(1) should be(Map("period" -> "2015-01-19T23:00:00.000Z/2015-01-20T23:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(2) should be(Map("period" -> "2015-01-20T23:00:00.000Z/2015-01-21T23:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(2) should be(Map("period" -> "2015-01-20T23:00:00.000Z/2015-01-21T23:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(3) should be(Map("period" -> "2015-01-21T23:00:00.000Z/2015-01-22T23:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(3) should be(Map("period" -> "2015-01-21T23:00:00.000Z/2015-01-22T23:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(4) should be(Map("period" -> "2015-01-22T23:00:00.000Z/2015-01-23T23:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(4) should be(Map("period" -> "2015-01-22T23:00:00.000Z/2015-01-23T23:00:00.000Z", "occupied" -> 0, "total" -> 0))
      }

      it("Should not count duplicated visits at the same time window") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("chosen search criteria")
        val start = new DateTime(2015, 1, 19, 0, 0, 0)
        val end = new DateTime(2015, 1, 24, 0, 0, 0)
        val searchCriteria = new SearchDoctorCriteria(
          Map(
            "name" -> "zbi",
            "location" -> "Grabi",
            "start" -> start,
            "end" -> end,
            "specializations" -> List("spec1", "spec2")
          )
        )
        And("doctors visits are available")
        And("some visits are set for the same time window")
        calendarRepoStub.doctorsVisitsResult = Map(
          UsersTestData.zbigniewReliga.id.get -> List(
            pulsantisVisit(new DateTime(2015, 1, 19, 8, 0, 0), 30),
            pulsantisVisit(new DateTime(2015, 1, 19, 8, 0, 0), 30),
            pulsantisVisit(new DateTime(2015, 1, 20, 8, 0, 0), 30),
            pulsantisVisit(new DateTime(2015, 1, 20, 8, 15, 0), 30)
          )
        )
        And("doctors are available")
        val userPromise = Promise[Result[Seq[AnyUser]]]
        (sut.userGateway.findDoctors _) when(
          new SearchUserCriteria(searchCriteria.map, false),
          user
          ) returns (
          userPromise.future
          )

        When("searching doctors")
        userPromise.success(Success[Seq[AnyUser]](List(UsersTestData.zbigniewReliga)))
        val result = Await.result(sut.findDoctors(searchCriteria, user), 1000 millisecond)

        Then("results are received")
        result.isSuccess should be(true)
        And("proper doctors are found")
        val doctors = result.asInstanceOf[Success[Seq[Doctor]]].value
        doctors.size should be(1)
        val doctor = doctors.toList(0)
        doctor should not be (null)
        And("locations are present")
        doctor.locations.size should be(2)
        val location1 = doctor.locations(0)
        location1.name should be("Pulsantis")
        val location2 = doctor.locations(1)
        location2.name should be("LuxMed")
        And("calendar summary info is attached to locations")
        And("duplicated events are counted only once")
        val calendar1 = location1.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar1.size should be(5)
        val calendar2 = location2.attributes.get("calendar").get.asInstanceOf[List[Map[String, String]]]
        calendar2.size should be(5)

        calendar1(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 30, "total" -> 240))
        calendar2(0) should be(Map("period" -> "2015-01-19T00:00:00.000Z/2015-01-20T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        //TODO should be 45 instead of 60
        calendar1(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 60, "total" -> 480))
        calendar2(1) should be(Map("period" -> "2015-01-20T00:00:00.000Z/2015-01-21T00:00:00.000Z", "occupied" -> 0, "total" -> 0))

        calendar1(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(2) should be(Map("period" -> "2015-01-21T00:00:00.000Z/2015-01-22T00:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(3) should be(Map("period" -> "2015-01-22T00:00:00.000Z/2015-01-23T00:00:00.000Z", "occupied" -> 0, "total" -> 480))

        calendar1(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
        calendar2(4) should be(Map("period" -> "2015-01-23T00:00:00.000Z/2015-01-24T00:00:00.000Z", "occupied" -> 0, "total" -> 0))
      }


    }

  }

  describe("Visit modification") {

    describe("Creating visits") {

      it("Should create visit in time window where doctor is working") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("visit scheduled in doctor's working days")
        val start = new DateTime(2020, 1, 20, 8, 0, 0)
        val visit = pulsantisVisit(start, 30)
        And("doctor doesn't have any other events during that time")
        calendarRepoStub.timeWindowFree = true
        calendarRepoStub.doctorVisits = List()
        And("doctor exists")
        val userPromise = Promise[Result[AnyUser]]
        (sut.userGateway.getUser _) when(
          visit.doctor.id.get,
          user
          ) returns (
          userPromise.future
          )

        When("creating new visit")
        userPromise.success(Success[AnyUser](UsersTestData.zbigniewReliga))
        val result = Await.result(sut.createPatientVisit(visit, user), 1000 millisecond)

        Then("visit is created")
        result.isSuccess should be(true)
        And("visit ID is returned")
        val visitId = result.asInstanceOf[Success[String]].value
        visitId should not be (null)
        And("e-mail about visit modification is sent")
        (sut.eMailGateway.send _) verify (*)
      }

      it("Should not create visit in time window where doctor is not working") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("visit is not scheduled in doctor's working days")
        val start = new DateTime(2020, 1, 20, 10, 0, 0)
        val visit = pulsantisVisit(start, 30)
        And("doctor doesn't have any other events during that time")
        calendarRepoStub.timeWindowFree = true
        calendarRepoStub.doctorVisits = List()
        And("doctor exists")
        val userPromise = Promise[Result[AnyUser]]
        (sut.userGateway.getUser _) when(
          visit.doctor.id.get,
          user
          ) returns (
          userPromise.future
          )

        When("creating new visit")
        userPromise.success(Success[AnyUser](UsersTestData.zbigniewReliga))
        val result = Await.result(sut.createPatientVisit(visit, user), 1000 millisecond)

        Then("visit is not created")
        result.isSuccess should be(false)
        And("reason is given")
        result.toString should include("Doctor zbigniew.religa@kunishu.com is not working between '2020-01-20T10:00:00.000Z' and '2020-01-20T10:30:00.000Z'")
        And("e-mail about visit modification is not sent")
        (sut.eMailGateway.send _) verify (*) repeat (0) times()
      }

      it("Should not create visit in occupied time window") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("visit scheduled in doctor's working days")
        val start = new DateTime(2020, 1, 20, 8, 0, 0)
        val visit = pulsantisVisit(start, 30)
        And("doctor does have other events during that time")
        calendarRepoStub.timeWindowFree = false
        calendarRepoStub.doctorVisits = List(pulsantisVisit(start, 30))
        And("doctor exists")
        val userPromise = Promise[Result[AnyUser]]
        (sut.userGateway.getUser _) when(
          visit.doctor.id.get,
          user
          ) returns (
          userPromise.future
          )

        When("creating new visit")
        userPromise.success(Success[AnyUser](UsersTestData.zbigniewReliga))
        val result = Await.result(sut.createPatientVisit(visit, user), 1000 millisecond)

        Then("visit is not created")
        result.isSuccess should be(false)
        And("reason is given")
        result.toString should include("Time window '2020-01-20T08:00:00.000Z' - '2020-01-20T08:30:00.000Z' is already taken")
        And("e-mail about visit modification is not sent")
        (sut.eMailGateway.send _) verify (*) repeat (0) times()
      }

      it("Should not create visit for invalid doctor user") {
        Given("any user")
        val user = UsersTestData.johnnyBravo
        And("visit scheduled in doctor's working days")
        val start = new DateTime(2020, 1, 20, 8, 0, 0)
        val visit = pulsantisVisit(start, 30)
        And("doctor doesn't have any other events during that time")
        calendarRepoStub.doctorVisits = List()
        And("given doctor is invalid")
        val userPromise = Promise[Result[AnyUser]]
        (sut.userGateway.getUser _) when(
          visit.doctor.id.get,
          user
          ) returns (
          userPromise.future
          )

        When("creating new visit")
        userPromise.success(Success[AnyUser](UsersTestData.pamelaAnderson))
        val result = Await.result(sut.createPatientVisit(visit, user), 1000 millisecond)

        Then("visit is not created")
        result.isSuccess should be(false)
        And("reason is given")
        result.toString should include("Doctor not found")
        And("e-mail about visit modification is not sent")
        (sut.eMailGateway.send _) verify (*) repeat (0) times()
      }

      it("Should not create visit on behalf of other users") {
        Given("any user")
        val user = UsersTestData.pamelaAnderson
        And("visit scheduled in doctor's working days")
        val start = new DateTime(2020, 1, 20, 8, 0, 0)
        val visit = pulsantisVisit(start, 30)
        And("doctor doesn't have any other events during that time")
        calendarRepoStub.doctorVisits = List()
        And("doctor exists")
        val userPromise = Promise[Result[AnyUser]]
        (sut.userGateway.getUser _) when(
          visit.doctor.id.get,
          user
          ) returns (
          userPromise.future
          )

        When("creating new visit on behalf of other users")
        userPromise.success(Success[AnyUser](UsersTestData.zbigniewReliga))
        val result = Await.result(sut.createPatientVisit(visit, user), 1000 millisecond)

        Then("visit is not created")
        result.isSuccess should be(false)
        And("reason is given")
        result.toString should include("is not a participant of")
        And("e-mail about visit modification is not sent")
        (sut.eMailGateway.send _) verify (*) repeat (0) times()
      }

    }

  }

}
