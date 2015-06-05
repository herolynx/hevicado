package com.kunishu.storage.test.data

import com.kunishu.storage.test.TestDBSetUp
import com.kunishu.test.data.VisitTestData._
import com.kunishu.test.data.UsersTestData._
import org.joda.time.DateTime
import org.scalatest.{Suite, BeforeAndAfter}

/**
 * Data of test users
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait TestDBCalendar extends TestDBSetUp {

  val zbigniewReligaCalendar = List(
    pulsantisVisit(new DateTime(2015, 1, 19, 8, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005c0"),
    cancelVisit(pulsantisVisit(new DateTime(2015, 1, 19, 8, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df842600ac0")),
    pulsantisVisit(new DateTime(2015, 1, 19, 8, 30, 0), 30, pamelaAnderson, zbigniewReliga, "546b8fd1ef660df8426005c1"),
    cancelVisit(pulsantisVisit(new DateTime(2015, 1, 19, 9, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df842600ac1")),
    pulsantisVisit(new DateTime(2015, 1, 19, 11, 0, 0), 60, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005c2"),
    pulsantisVisit(new DateTime(2015, 1, 19, 13, 0, 0), 60, pamelaAnderson, zbigniewReliga, "546b8fd1ef660df8426005c3"),
    cancelVisit(pulsantisVisit(new DateTime(2015, 1, 19, 15, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df842600ac4")),

    pulsantisVisit(new DateTime(2015, 1, 20, 9, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005c4"),
    cancelVisit(pulsantisVisit(new DateTime(2015, 1, 20, 9, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df842600ac2")),
    pulsantisVisit(new DateTime(2015, 1, 20, 9, 30, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005c5"),
    cancelVisit(pulsantisVisit(new DateTime(2015, 1, 20, 10, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df842600ac3")),
    pulsantisVisit(new DateTime(2015, 1, 20, 12, 0, 0), 60, pamelaAnderson, zbigniewReliga, "546b8fd1ef660df8426005c6"),
    pulsantisVisit(new DateTime(2015, 1, 20, 13, 0, 0), 60, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005c7"),

    luxMedVisit(new DateTime(2015, 1, 21, 8, 30, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005c8"),
    luxMedVisit(new DateTime(2015, 1, 21, 9, 0, 0), 30, pamelaAnderson, zbigniewReliga, "546b8fd1ef660df8426005c9"),
    luxMedVisit(new DateTime(2015, 1, 21, 10, 0, 0), 60, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005d0"),
    luxMedVisit(new DateTime(2015, 1, 21, 12, 0, 0), 60, pamelaAnderson, zbigniewReliga, "546b8fd1ef660df8426005d1"),

    luxMedVisit(new DateTime(2015, 1, 22, 10, 0, 0), 30, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005d2"),
    luxMedVisit(new DateTime(2015, 1, 22, 11, 30, 0), 30, doctorQuin, zbigniewReliga, "546b8fd1ef660df8426005d3"),
    luxMedVisit(new DateTime(2015, 1, 22, 13, 0, 0), 60, pamelaAnderson, zbigniewReliga, "546b8fd1ef660df8426005d4"),
    luxMedVisit(new DateTime(2015, 1, 22, 15, 0, 0), 60, johnnyBravo, zbigniewReliga, "546b8fd1ef660df8426005d5")
  )

  val drQuinCalendar = List(
    pulsantisVisit(new DateTime(2015, 1, 19, 8, 0, 0), 30, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005e0"),
    pulsantisVisit(new DateTime(2015, 1, 19, 8, 30, 0), 30, pamelaAnderson, doctorQuin, "546b8fd1ef660df8426005e1"),
    pulsantisVisit(new DateTime(2015, 1, 19, 11, 0, 0), 60, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005e2"),
    pulsantisVisit(new DateTime(2015, 1, 19, 13, 0, 0), 60, pamelaAnderson, doctorQuin, "546b8fd1ef660df8426005e3"),

    pulsantisVisit(new DateTime(2015, 1, 20, 9, 0, 0), 30, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005e4"),
    pulsantisVisit(new DateTime(2015, 1, 20, 9, 30, 0), 30, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005e5"),
    pulsantisVisit(new DateTime(2015, 1, 20, 12, 0, 0), 60, pamelaAnderson, doctorQuin, "546b8fd1ef660df8426005e6"),
    pulsantisVisit(new DateTime(2015, 1, 20, 13, 0, 0), 60, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005e7"),

    luxMedVisit(new DateTime(2015, 1, 21, 8, 30, 0), 30, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005e8"),
    luxMedVisit(new DateTime(2015, 1, 21, 9, 0, 0), 30, pamelaAnderson, doctorQuin, "546b8fd1ef660df8426005e9"),
    luxMedVisit(new DateTime(2015, 1, 21, 10, 0, 0), 60, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005f0"),
    luxMedVisit(new DateTime(2015, 1, 21, 12, 0, 0), 60, pamelaAnderson, doctorQuin, "546b8fd1ef660df8426005f1"),

    luxMedVisit(new DateTime(2015, 1, 22, 10, 0, 0), 30, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005f2"),
    luxMedVisit(new DateTime(2015, 1, 22, 11, 30, 0), 30, zbigniewReliga, doctorQuin, "546b8fd1ef660df8426005f3"),
    luxMedVisit(new DateTime(2015, 1, 22, 13, 0, 0), 60, pamelaAnderson, doctorQuin, "546b8fd1ef660df8426005f4"),
    luxMedVisit(new DateTime(2015, 1, 22, 15, 0, 0), 60, johnnyBravo, doctorQuin, "546b8fd1ef660df8426005f5")
  )

  override def initData() = {
    initCollection(collectionName, zbigniewReligaCalendar)
    initCollection(collectionName, drQuinCalendar)
  }

}
