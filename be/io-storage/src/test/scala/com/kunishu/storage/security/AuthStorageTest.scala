package com.kunishu.storage.security

import com.kunishu.model.security.AccessPass
import com.kunishu.model.user.{UserAttrs, AnyUser}
import com.kunishu.storage.test.TestDB
import com.kunishu.storage.test.data.{TestDBUsers}
import com.mongodb.casbah.Imports._
import org.scalatest.{Matchers, GivenWhenThen, FunSpec}
import com.kunishu.test.data.UsersTestData._

/**
 * Test cases related with keeping authentication/authorization related data
 *
 * @author Michal Wronski
 * @since 1.0
 */
class AuthStorageTest extends FunSpec with GivenWhenThen with TestDB with TestDBUsers with Matchers
with AuthStorage {

  override val collectionName = "tokens"
  override protected val users: MongoCollection = db("auth-users")

  val cache = scala.collection.mutable.Map[String, AnyUser]()

  override def cleanData() {
    db(collectionName).drop()
    db("auth-users").drop()
  }

  override def initData() = {
    val users = List(
      johnnyBravo,
      zbigniewReliga,
      pamelaAnderson,
      doctorQuin
    )
    initCollection("auth-users", users)
  }

  describe("Authentication storage") {

    describe("User info") {

      it("Should find user by existing login") {
        Given("existing login")
        val login = johnnyBravo.eMail

        When("searching user")
        val user = findUserByLogin(login)

        Then("user is found")
        user.isDefined should be(true)
        user.get.eMail should be(login)
      }

      it("Should not find a user by non-existing login") {
        Given("login doesn't")
        val login = "non-existing"

        When("searching user")
        val user = findUserByLogin(login)

        Then("user is not found")
        user.isDefined should be(false)
      }

      it("Should find user by existing ID") {
        Given("existing ID")
        val id = johnnyBravo.id.get

        When("searching user")
        val user = findUserById(id)

        Then("user is found")
        user.isDefined should be(true)
        user.get.id.get should be(id)
      }

      it("Should not find user by non-existing ID") {
        Given("ID doesn't exist")
        val id = "546b8fd7ef660df8426005a0"

        When("searching user")
        val user = findUserById(id)

        Then("user is not found")
        user.isDefined should be(false)
      }

    }

    describe("Token info") {

      it("Should find user tokens by login") {
        Given("any user")
        val user = johnnyBravo
        And("token")
        val tokenPass = AccessPass.createToken(user)
        And("token has been created")
        create(tokenPass)
        And("also token for other users exists")
        create(AccessPass.createToken(zbigniewReliga))

        When("searching token by user login")
        val tokens = findByLogin(user.eMail)

        Then("user tokens are found")
        tokens.size should be(1)
        tokens(0).user should be(user)
      }

      it("Should find user tokens by user's ID") {
        Given("any user")
        val user = johnnyBravo
        And("token")
        val tokenPass = AccessPass.createToken(user)
        And("token has been created")
        create(tokenPass)
        And("also token for other users exists")
        create(AccessPass.createToken(zbigniewReliga))

        When("searching token by user's ID")
        val tokens = findByUserId(user.id.get)

        Then("user tokens are found")
        tokens.size should be(1)
        tokens(0).user should be(user)
      }

      it("Should find token details by token ID") {
        Given("any user")
        val user = johnnyBravo
        And("token")
        val tokenPass = AccessPass.createToken(user)
        And("token has been created")
        create(tokenPass)
        And("also token for other users exists")
        create(AccessPass.createToken(zbigniewReliga))

        When("searching user's token by token ID")
        val dbToken = findByToken(tokenPass.token)

        Then("token is found")
        dbToken.isDefined should be(true)
        tokenPass.attributes should be(dbToken.get.attributes.filterKeys(!_.equals("id")))
      }

    }

    describe("Token modifications") {

      it("Should create token for user") {
        Given("any user")
        val user = johnnyBravo
        And("token")
        val tokenPass = AccessPass.createToken(user)

        When("creating token")
        create(tokenPass)

        Then("token is created")
        And("user can be reached using existing token")
        val dbToken = findByToken(tokenPass.token)
        dbToken.isDefined should be(true)
        dbToken.get.user should be(user)
      }

      it("Should update token for user") {
        Given("any user")
        val user = johnnyBravo
        And("token exists")
        val tokenPass = AccessPass.createToken(user)
        create(tokenPass)
        val dbToken = findByToken(tokenPass.token).get
        And("token has been changed")
        val changedToken = AccessPass.create(dbToken.attributes ++ Map("newAttr" -> "newValue"))

        When("updating token")
        update(changedToken)

        Then("token is updated")
        val changedDbToken = findByToken(tokenPass.token)
        changedDbToken.isDefined should be(true)
        And("only chosen data is changed")
        changedDbToken.get should be(AccessPass.create(dbToken.attributes ++ Map("newAttr" -> "newValue")))
      }

      it("Should delete token of a user") {
        Given("any user")
        val user = johnnyBravo
        And("token exists")
        val tokenPass = AccessPass.createToken(user)
        create(tokenPass)
        val dbToken = findByToken(tokenPass.token)
        dbToken.isDefined should be(true)

        When("deleting existing token")
        delete(dbToken.get.id.get)

        Then("token is deleted")
        And("user can not be reached using token anymore")
        findByToken(tokenPass.token) should be(None)
      }

      it("Should create temporary password for user") {
        Given("any user")
        val user = johnnyBravo
        And("temporary password")
        val tmpPasswordPass = AccessPass.createTmpPassword(user)

        When("creating temporary password")
        create(tmpPasswordPass._2)

        Then("temporary password is created")
        val dbTokens = findByLogin(user.eMail)
        dbTokens.size should be(1)
      }

      it("Should delete temporary password for user") {
        Given("any user")
        val user = johnnyBravo
        And("temporary password exists")
        val tmpPasswordPass = AccessPass.createTmpPassword(user)
        create(tmpPasswordPass._2)
        val dbTokens = findByLogin(user.eMail)
        dbTokens.size should be(1)

        When("deleting temporary password")
        delete(dbTokens(0).id.get)

        Then("temporary password is deleted")
        findByLogin(user.eMail).size should be(0)
      }

    }

  }

}
