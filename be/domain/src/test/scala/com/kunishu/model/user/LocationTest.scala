package com.kunishu.model.user

import org.joda.time.{Interval, DateTime, DateTimeZone}
import org.scalatest.{OneInstancePerTest, Matchers, GivenWhenThen, FunSpec}
import com.kunishu.core.date.Date._

/**
 * Unit tests related with user's location
 *
 * @author Michal Wronski
 * @since 1.1
 */
class LocationTest extends FunSpec with GivenWhenThen with Matchers with OneInstancePerTest {

  DateTimeZone.setDefault(DateTimeZone.UTC)

  describe("Working hours of location") {

    describe("Getting info about working time") {

      it("Should get working time in working day") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "09:00",
            "end" -> "16:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )

        When("getting working time in working day")
        val startTime = workingHours.startDayTime(new DateTime(2015, 2, 2, 12, 0, 0))
        val endTime = workingHours.endDayTime(new DateTime(2015, 2, 2, 12, 0, 0))

        Then("working time is returned")
        startTime.isDefined should be(true)
        startTime.get.toString should be("2015-02-02T09:00:00.000+01:00")
        startTime.get.isEqual(new DateTime(2015, 2, 2, 8, 0, 0).withZoneRetainFields(DateTimeZone.UTC)) should be(true)

        endTime.isDefined should be(true)
        endTime.get.toString should be("2015-02-02T16:00:00.000+01:00")
        endTime.get.isEqual(new DateTime(2015, 2, 2, 15, 0, 0).withZoneRetainFields(DateTimeZone.UTC)) should be(true)
      }

      it("Should not get working time for non-working day") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "08:00",
            "end" -> "15:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )

        When("getting working time in non-working day")
        val startTime = workingHours.startDayTime(new DateTime(2015, 2, 3, 12, 0, 0))
        val endTime = workingHours.endDayTime(new DateTime(2015, 2, 3, 12, 0, 0))

        Then("no working time is returned")
        startTime.isDefined should be(false)
        endTime.isDefined should be(false)
      }

      it("Should get working time in working day according to time zone offset") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "01:00",
            "end" -> "03:00",
            "day" -> "Monday",
            "tzOffset" -> 120
          )
        )

        When("getting working time in working day")
        val startTime = workingHours.startDayTime(new DateTime(2015, 2, 2, 12, 0, 0))
        val endTime = workingHours.endDayTime(new DateTime(2015, 2, 2, 12, 0, 0))

        Then("working time is returned")
        startTime.isDefined should be(true)
        startTime.get.toString should be("2015-02-02T01:00:00.000+02:00")
        startTime.get.isEqual(new DateTime(2015, 2, 1, 23, 0, 0).withZoneRetainFields(DateTimeZone.UTC)) should be(true)

        endTime.isDefined should be(true)
        endTime.get.toString should be("2015-02-02T03:00:00.000+02:00")
        endTime.get.isEqual(new DateTime(2015, 2, 2, 1, 0, 0).withZoneRetainFields(DateTimeZone.UTC)) should be(true)
      }

      it("Should get working time based on overlapping time interval") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "08:00",
            "end" -> "16:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )
        And("time interval that overlaps working hours")
        val startTime = new DateTime(2015, 2, 1, 12, 0, 0)
        val endTime = new DateTime(2015, 2, 2, 12, 0, 0)

        When("getting working time in working day")
        val interval = workingHours.interval(new Interval(startTime, endTime))

        Then("working time is returned")
        interval.isDefined should be(true)
        interval.get.getStart.toString should be("2015-02-02T08:00:00.000+01:00")
        interval.get.getEnd.toString should be("2015-02-02T16:00:00.000+01:00")
      }

      it("Should not get working time based on onon-verlapping time interval") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "08:00",
            "end" -> "16:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )
        And("time interval that doesn't overlaps working hours")
        val startTime = new DateTime(2015, 2, 1, 12, 0, 0)
        val endTime = new DateTime(2015, 2, 1, 23, 0, 0)

        When("getting working time in working day")
        val interval = workingHours.interval(new Interval(startTime, endTime))

        Then("no working time is returned")
        interval.isDefined should be(false)
      }

    }

    describe("Working hours intervals") {

      it("Should get interval for working hours") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "08:00",
            "end" -> "16:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )

        When("getting working time interval")
        val interval = workingHours.interval(new DateTime(2015, 2, 2, 12, 0, 0))

        Then("proper time period is returned")
        interval.isDefined should be(true)
        interval.get.getStart.toString should be("2015-02-02T08:00:00.000+01:00")
        interval.get.getEnd.toString should be("2015-02-02T16:00:00.000+01:00")
      }

      it("Should check whether time period overlaps working hours for the same time zone") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "08:00",
            "end" -> "16:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )
        And("time period in the same time zone")
        val start = new DateTime(2015, 2, 2, 8, 0, 0).withZoneRetainFields(DateTimeZone.forOffsetHoursMinutes(1, 0))
        val end = new DateTime(2015, 2, 2, 8, 30, 0).withZoneRetainFields(DateTimeZone.forOffsetHoursMinutes(1, 0))

        When("checking whether time period overlaps working hours")
        val overlaps = workingHours.overlap(start, end)

        Then("proper overlapping time period is returned")
        overlaps.isDefined should be(true)
        overlaps.get.getStart.toString should be("2015-02-02T08:00:00.000+01:00")
        overlaps.get.getEnd.toString should be("2015-02-02T08:30:00.000+01:00")
      }

      it("Should check whether time period overlaps working hours for different time zone") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "08:00",
            "end" -> "16:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )
        And("time period in the different time zone")
        val start = new DateTime(2015, 2, 2, 6, 30, 0).withZoneRetainFields(DateTimeZone.UTC)
        val end = new DateTime(2015, 2, 2, 7, 30, 0).withZoneRetainFields(DateTimeZone.UTC)

        When("checking whether time period overlaps working hours")
        val overlaps = workingHours.overlap(start, end)

        Then("proper overlapping time period is returned")
        overlaps.isDefined should be(true)
        overlaps.get.getStart.toString should be("2015-02-02T08:00:00.000+01:00")
        overlaps.get.getEnd.toString should be("2015-02-02T08:30:00.000+01:00")
      }

      it("Should not return overlapping interval for time period outside working hours") {
        Given("working hours defined")
        val workingHours = new WorkingHours(
          Map(
            "start" -> "08:00",
            "end" -> "16:00",
            "day" -> "Monday",
            "tzOffset" -> 60
          )
        )
        And("time period in the same time zone")
        val start = new DateTime(2015, 2, 2, 7, 0, 0).withZoneRetainFields(DateTimeZone.forOffsetHoursMinutes(1, 0))
        val end = new DateTime(2015, 2, 2, 8, 0, 0).withZoneRetainFields(DateTimeZone.forOffsetHoursMinutes(1, 0))

        When("checking whether time period overlaps working hours")
        val overlaps = workingHours.overlap(start, end)

        Then("no overlapping time period is returned")
        overlaps.isDefined should be(false)
      }

    }

  }

}
