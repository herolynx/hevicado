package com.kunishu.security.logic

import com.kunishu.core.security.Encryption
import com.kunishu.model.messages.{LostPasswordEmail, EmailGateway}
import com.kunishu.model.security.{Token, TempPassword, AccessPass}
import com.kunishu.model.user.{UserAttrs, AnyUser}
import com.kunishu.security.io.AuthenticationRepo

/**
 * Use cases related with authenticating users
 *
 * @author Michal Wronski
 * @since 1.1
 */
trait UserAuthentication {

  tokens: TokenAuthentication =>

  protected val authRepo: AuthenticationRepo
  protected val eMailGateway: EmailGateway

  /**
   * Login user
   * @param login user's login (e-mail)
   * @param password user's password
   * @return non-nullable option with authentication user
   */
  def authUser(login: String, password: String): Option[AccessPass] =
    authByCredentials(login, password).
      toLeft(authByOneTimePass(login, password)) match {
      case Right(credToken) => credToken
      case Left(tempPassToken) => Some(tempPassToken)
    }

  /**
   * Regain access to account by generation of temporary password
   * @param user user who wants to regain access to his account
   */
  def regainAccount(user: AnyUser): Unit = {
    val repoUser = authRepo.findUserByLogin(user.eMail)
    repoUser.
      map(
        user => {
          val tmpPass = AccessPass.createTmpPassword(user)
          authRepo.create(tmpPass._2)
          eMailGateway.send(new LostPasswordEmail(tmpPass._1, repoUser.get))
        }
      )
  }

  /**
   * Authenticate user by temporary password for one time access
   * @param login user's login/e-mail
   * @param password user's password
   * @return optional access pass
   */
  private def authByOneTimePass(login: String, password: String): Option[Token] = {
    val pass = authRepo.findByLogin(login)
    val givenPass = Encryption.hash(password)
    val tempPass = pass.
      filter(_.isInstanceOf[TempPassword]).
      filter(_.isValid).
      map(_.asInstanceOf[TempPassword]).
      map(
        pass => {
          if (pass.password.equals(givenPass)) {
            authRepo.delete(pass.id.get)
            Some(tokens.createToken(pass.user))
          } else {
            None
          }
        }
      ).
      filter(_.isDefined)
    if (tempPass.nonEmpty) {
      tempPass.head
    } else {
      None
    }
  }

  /**
   * Authenticate user by his main password
   * @param login user's login/e-mail
   * @param password user's password
   * @return optional access pass
   */
  private def authByCredentials(login: String, password: String): Option[Token] = {
    val user = authRepo.findUserByLogin(login)
    user.
      map(_.attributes.get(UserAttrs.attPassword)).
      map(_.get.toString).
      map(_.equals(Encryption.hash(password))).
      flatMap(
        _ match {
          case true => Some(tokens.createToken(user.get))

          case false => None
        }
      )
  }


}