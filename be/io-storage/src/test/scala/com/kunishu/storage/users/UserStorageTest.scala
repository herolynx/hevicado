package com.kunishu.storage.users

import com.kunishu.model.EntityAttrs
import com.kunishu.model.user._
import com.kunishu.storage.StorageTest
import com.kunishu.storage.test.TestDB
import com.kunishu.storage.test.data.TestDBUsers
import org.scalatest.{Matchers, GivenWhenThen, FunSpec}
import com.kunishu.test.data.UsersTestData._

/**
 * Test cases related with keeping user related data
 *
 * @author Michal Wronski
 * @since 1.0
 */
class UserStorageTest extends FunSpec with GivenWhenThen with TestDB with TestDBUsers with Matchers
with StorageTest[AnyUser]
with UserStorage {

  override val collectionName = "users"

  describe("User storage") {

    it("Should get user by id") {
      Given("user exists")
      val id = johnnyBravo.id.get

      When("getting user by id")
      val user = get(id)

      Then("user is found")
      user.isDefined should be(true)
      user.get.eMail should be(johnnyBravo.eMail)
    }

    it("Should not get user by non-existing id") {
      Given("user doesn't exists")
      val id = "546b8fd1ef660df8426005a9"

      When("getting user by id")
      val user = get(id)

      Then("user is not found")
      user.isDefined should be(false)
    }

    it("Should verify existing login") {
      Given("user exists")
      val login = johnnyBravo.eMail

      When("checking whether login exists")
      val loginFree = isLoginFree(login)

      Then("login is verified as occupied")
      loginFree should be(false)
    }

    it("Should verify non-existing login") {
      Given("user doesn't exist")
      val login = "no@kunishu.com"

      When("checking whether login exists")
      val loginFree = isLoginFree(login)

      Then("login is verified as free")
      loginFree should be(true)
    }

    describe("User search") {

      import com.kunishu.model.user.UsersCriteria._

      it("Should find users by name") {
        Given("criteria by any user's name")
        val criteria = new SearchUserCriteria(Map(
          attName -> "jo"
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(1)
        users(0).eMail should be(johnnyBravo.eMail)
      }

      it("Should find doctors by name") {
        Given("criteria by doctor's name")
        val criteria = new SearchUserCriteria(Map(
          attName -> "zb"
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(1)
        users(0).eMail should be(zbigniewReliga.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(2)
        drReliga.locations(0).name should be("Pulsantis")
        drReliga.locations(1).name should be("LuxMed")
      }

      it("Should find users by roles") {
        Given("criteria by user roles")
        val criteria = new SearchUserCriteria(Map(
          attRoles -> List(UserAttrs.roleDoctor)
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(2)
        users(0).eMail should be(zbigniewReliga.eMail)
        users(1).eMail should be(doctorQuin.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(2)
        drReliga.locations(0).name should be("Pulsantis")
        drReliga.locations(1).name should be("LuxMed")
        val drQuin = users(1).asInstanceOf[Doctor]
        drQuin.locations.size should be(1)
        drQuin.locations(0).name should be("Pulsantis")
      }

      it("Should find users by city") {
        Given("criteria by city location")
        val criteria = new SearchUserCriteria(Map(
          attLocation -> "Wro"
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(2)
        users(0).eMail should be(zbigniewReliga.eMail)
        users(1).eMail should be(doctorQuin.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(2)
        drReliga.locations(0).name should be("Pulsantis")
        drReliga.locations(1).name should be("LuxMed")
        val drQuin = users(1).asInstanceOf[Doctor]
        drQuin.locations.size should be(1)
        drQuin.locations(0).name should be("Pulsantis")
      }

      it("Should find users by street") {
        Given("criteria by name")
        val criteria = new SearchUserCriteria(Map(
          attLocation -> "Dominikanski"
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(1)
        users(0).eMail should be(zbigniewReliga.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(1)
        drReliga.locations(0).name should be("LuxMed")
      }

      it("Should find users by name of the location") {
        Given("criteria by location name")
        val criteria = new SearchUserCriteria(Map(
          attLocation -> "LuxMed"
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(1)
        users(0).eMail should be(zbigniewReliga.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(1)
        drReliga.locations(0).name should be("LuxMed")
      }

      it("Should find doctors by specialization") {
        Given("criteria by specialization")
        val criteria = new SearchUserCriteria(Map(
          attSpecializations -> List("head")
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(1)
        users(0).eMail should be(zbigniewReliga.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(1)
        drReliga.locations(0).name should be("LuxMed")
      }

      it("Should handle reg exp and special marks in specializations") {
        Given("criteria by specialization")
        And("specialization criteria contains special marks")
        val criteria = new SearchUserCriteria(Map(
          attSpecializations -> List("$$head-1")
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(1)
        users(0).eMail should be(zbigniewReliga.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(1)
        drReliga.locations(0).name should be("LuxMed")
      }

      it("Should find doctors by location and specialization") {
        Given("doctor's criteria")
        val criteria = new SearchUserCriteria(Map(
          attLocation -> "Grabi",
          attSpecializations -> List("heart")
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(2)
        users(0).eMail should be(zbigniewReliga.eMail)
        users(1).eMail should be(doctorQuin.eMail)
        And("locations that don't meet criteria are filtered out")
        val drReliga = users(0).asInstanceOf[Doctor]
        drReliga.locations.size should be(1)
        drReliga.locations(0).name should be("Pulsantis")
        val drQuin = users(1).asInstanceOf[Doctor]
        drQuin.locations.size should be(1)
        drQuin.locations(0).name should be("Pulsantis")
      }

      it("Should return chosen page of search result") {
        Given("doctor's criteria")
        And("chosen page of results")
        val criteria = new SearchUserCriteria(Map(
          attLocation -> "Grabi",
          attSpecializations -> List("heart"),
          "startIndex" -> 1,
          "count" -> 1
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(1)
        users(0).eMail should be(doctorQuin.eMail)
      }

      it("Should find users by case insensitive criteria") {
        Given("criteria by city location")
        val criteria = new SearchUserCriteria(Map(
          attLocation -> "wRo"
        ))

        When("searching users")
        val users = find(criteria)

        Then("proper users are found")
        users.size should be(2)
        users(0).eMail should be(zbigniewReliga.eMail)
        users(1).eMail should be(doctorQuin.eMail)
      }

    }

  }


  override def testEntity: AnyUser = {
    import com.kunishu.model.user.UserAttrs._
    new User(
      Map(
        attFirstName -> "Johny",
        attLastName -> "Mnemonic",
        attRole -> roleUser,
        attEMail -> "johnny.mnemonic@kunishu.com"
      )
    )
  }


  override def modifyEntity(entity: AnyUser, id: String, attributes: Map[String, Any]): AnyUser =
    new User(
      entity.attributes ++ attributes ++ Map(EntityAttrs.attId -> id)
    )
}
