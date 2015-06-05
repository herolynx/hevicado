package com.kunishu.security.logic

import com.kunishu.model.security.{AccessPass, Token}
import com.kunishu.model.user.{AnyUser, User}
import com.kunishu.security.io.AuthenticationRepo
import com.kunishu.test.data.UsersTestData
import org.joda.time.DateTime
import org.scalamock.scalatest.MockFactory
import org.scalatest.{FunSpec, GivenWhenThen, Matchers, OneInstancePerTest}

/**
 * Unit tests related with handling broadcast messages in token authentication
 *
 * @author Michal Wronski
 * @since 1.2
 */
class TokenBroadcastTest extends FunSpec with GivenWhenThen with MockFactory with Matchers with OneInstancePerTest {

  val authRepoStub = new Object with AuthenticationRepo {

    override def findUserByLogin(login: String): Option[AnyUser] = None

    var passByUserId = List[AccessPass]()

    override def findByUserId(id: String): Seq[AccessPass] = passByUserId

    val updated = scala.collection.mutable.ListBuffer[AccessPass]()

    override def update(pass: AccessPass): Boolean = {
      updated += pass
      true
    }

    override def findByToken(token: String): Option[AccessPass] = None

    var userById: Option[AnyUser] = None

    override def findUserById(id: String): Option[AnyUser] = userById

    override def delete(id: String): Unit = {}

    override def create(pass: AccessPass): String = null

    override def findByLogin(login: String): Seq[AccessPass] = List()
  }

  val sut = new Object with TokenAuthentication {
    protected override val authRepo: AuthenticationRepo = authRepoStub
  }


  describe("Handling user brodcast notifications in tokens") {

    import com.kunishu.model.user.UserAttrs._

    it("Should update user's active tokens after user change") {
      Given("any user")
      var user = UsersTestData.johnnyBravo
      And("user has tokens")
      authRepoStub.passByUserId = List(
        AccessPass.createToken(user, new DateTime().minusYears(1)),
        AccessPass.createToken(user),
        AccessPass.createTmpPassword(user, 30, new DateTime().minusYears(1))._2,
        AccessPass.createTmpPassword(user)._2
      )
      And("user has been changed")
      user = new User(user.attributes ++ Map(attEMail -> "big.johnny@kunishu.com"))
      authRepoStub.userById = Some(user)

      When("changing info about user in tokens")
      sut.updateUserInfo(user)

      Then("only valid tokens are updated")
      authRepoStub.updated.size should be(2)
      And("only info about user is changed")
      authRepoStub.updated(0) should be(AccessPass.create(authRepoStub.passByUserId(1).attributes ++ Map("user" -> user.attributes)))
      authRepoStub.updated(1) should be(AccessPass.create(authRepoStub.passByUserId(3).attributes ++ Map("user" -> user.attributes)))
    }

  }

}
