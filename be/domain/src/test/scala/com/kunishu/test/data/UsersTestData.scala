package com.kunishu.test.data

import com.kunishu.model.user.{Doctor, UserAttrs, User}
import LocationTestData._

/**
 * Sample data that can be used for testing purposes
 *
 * @author Michal Wronski
 * @since
 */
object UsersTestData {

  import com.kunishu.model.EntityAttrs.attId
  import UserAttrs._

  def johnnyBravo =
    new User(
      Map(
        attId -> "546b8fd1ef660df8426005a0",
        attFirstName -> "Johny",
        attLastName -> "Bravo",
        attRole -> roleUser,
        attEMail -> "johnny.bravo@kunishu.com",
        "additional" -> "add-123"
      )
    )

  def zbigniewReliga =
    new Doctor(
      Map(
        attId -> "546b8fd1ef660df8426005a1",
        attFirstName -> "Zbigniew",
        attLastName -> "Religa",
        attRole -> roleDoctor,
        attEMail -> "zbigniew.religa@kunishu.com",
        attLocations -> List(pulsantis().attributes, luxMed().attributes),
        "additional" -> "add-234"
      )
    )

  def pamelaAnderson =
    new User(
      Map(
        attId -> "546b8fd1ef660df8426005a2",
        attFirstName -> "Pamela",
        attLastName -> "Anderson",
        attRole -> roleUser,
        attEMail -> "pamela.anderson@kunishu.com",
        "additional" -> "add-345"
      )
    )

  def doctorQuin =
    new Doctor(
      Map(
        attId -> "546b8fd1ef660df8426005a3",
        attFirstName -> "Michaela",
        attLastName -> "Quinn",
        attRole -> roleDoctor,
        attEMail -> "michaela.quinn@kunishu.com",
        attLocations -> List(pulsantis().attributes),
        "additional" -> "add-456"
      )
    )

}
