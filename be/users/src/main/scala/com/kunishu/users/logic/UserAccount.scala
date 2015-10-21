package com.kunishu.users.logic

import com.kunishu.core.monit.Instrumented
import com.kunishu.core.processing
import com.kunishu.core.processing.{ UnauthorizedError, ValidationError, Result}
import com.kunishu.core.security.Encryption._
import com.kunishu.core.processing.Result._
import com.kunishu.model.user.AnyUser
import com.kunishu.model.user.UserAttrs._
import com.kunishu.model.user.Users._
import com.kunishu.users.io.UserRepo
import com.kunishu.model.user.UserValidator._

/**
 * Use cases related with user account
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UserAccount extends Instrumented {

  protected val userRepo: UserRepo

  /**
   * Update user's account
   * @param userToUpdate account to be updated
   * @param user user accessing account
   * @return non-nullable result
   */
  def updateAccount(userToUpdate: AnyUser, user: AnyUser): Result[Boolean] = segment("updateAccount") {
    var result: Result[Boolean] = null
    if (userToUpdate.id.isEmpty || !user.id.get.equals(userToUpdate.id.get)) {
      result = UnauthorizedError("Cannot update user's account: " + userToUpdate.id)
    } else if (!userToUpdate.eMail.equals(user.eMail) && !userRepo.isLoginFree(userToUpdate.eMail)) {
      result = ValidationError("Cannot change e-mail as new one is already taken: " + userToUpdate.eMail)
    } else {
      //update account
      var userAccount = userToUpdate
      val password = userAccount.attributes.get(attPassword)
      if (password.isDefined) {
        userAccount = modifyUser(userAccount, Map(attPassword -> hash(password.get.toString)))
      }
      result = toResult(userRepo.update(userAccount), "Couldn't save changes in repository - user: " + userToUpdate.eMail)
    }
    result
  }

  /**
   * Register user
   * @param user account to be created
   * @return non-nullable result
   */
  def createAccount(user: AnyUser): Result[String] = segment("createAccount") {
    var result: Result[String] = null
    val validationResult = isValid[String](user)
    val hashedPassword = user.attributes.get(attPassword).map(p => hash(p.toString)).getOrElse("")
    if (!validationResult.isSuccess) {
      result = validationResult
    } else if (hashedPassword.isEmpty) {
      result = ValidationError("Password not given")
    } else if (!userRepo.isLoginFree(user.eMail)) {
      result = ValidationError("E-mail already taken")
    } else {
      //create account
      val newUser = modifyUser(user, Map(attRole -> roleUser, attPassword -> hashedPassword))
      val newUserId = userRepo.create(newUser)
      result = processing.Success(newUserId)
    }
    result
  }

}
