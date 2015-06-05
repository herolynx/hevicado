package com.kunishu.test.data

import com.kunishu.model.user.Location
import org.joda.time.DateTimeZone

/**
 * Sample locations that can be used for testing purposes
 *
 * @author Michal Wronski
 * @since 1.0
 */
object LocationTestData {

  DateTimeZone.setDefault(DateTimeZone.UTC)

  import com.kunishu.model.EntityAttrs.attId

  def luxMed(withTemplates: Boolean = false) = {
    filterLocation(
      Location(
        Map(
          attId -> "546b8fd1ef660df8426005b0",
          "name" -> "LuxMed",
          "address" -> Map(
            "street" -> "Plac Dominikanski",
            "city" -> "Wroclaw",
            "country" -> "Poland"
          ),
          "color" -> "red",
          "specializations" -> List("head", "$$head-1"),
          "working_hours" -> List(
            Map(
              "day" -> "Wednesday",
              "start" -> "09:00",
              "end" -> "17:00"
            ),
            Map(
              "day" -> "Thursday",
              "start" -> "08:00",
              "end" -> "16:00"
            )
          ),
          "templates" -> List(
            Map(
              "id" -> "551d40f2872737d547613080",
              "name" -> "Eye examination",
              "durations" -> List(30, 60)
            ),
            Map(
              "id" -> "551d40f2872737d547613081",
              "name" -> "Heart examination",
              "durations" -> List(30)
            )
          )
        )
      ),
      withTemplates)
  }

  def pulsantis(withTemplates: Boolean = false) = {
    filterLocation(
      Location(
        Map(
          attId -> "546b8fd1ef660df8426005b1",
          "name" -> "Pulsantis",
          "address" -> Map(
            "street" -> "Grabiszynska 8",
            "city" -> "Wroclaw",
            "country" -> "Poland"
          ),
          "specializations" -> List("heart", "$$heart-1"),
          "color" -> "red",
          "working_hours" -> List(
            Map(
              "day" -> "Monday",
              "start" -> "08:00",
              "end" -> "10:00"
            ),
            Map(
              "day" -> "Monday",
              "start" -> "12:00",
              "end" -> "14:00"
            ),
            Map(
              "day" -> "Tuesday",
              "start" -> "08:00",
              "end" -> "16:00"
            )
          ),
          "templates" -> List(
            Map(
              "id" -> "551d40f2872737d547613082",
              "name" -> "Eye examination",
              "durations" -> List(30, 60)
            ),
            Map(
              "id" -> "551d40f2872737d547613083",
              "name" -> "Finger examination",
              "durations" -> List(30)
            )
          )
        )
      ),
      withTemplates)
  }

  private def filterLocation(location: Location, withTemplates: Boolean) = {
    if (withTemplates) {
      location
    } else {
      new Location(location.attributes.filter(attr => !attr.equals("templates")))
    }
  }

}
