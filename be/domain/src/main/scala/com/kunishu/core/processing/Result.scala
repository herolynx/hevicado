package com.kunishu.core.processing

object Result {

  /**
   * Convert optionable value as a result
   * @param value value to be converted
   * @param absentMsg message to be used when value is absent
   * @tparam T type of value
   * @return non-nullable result
   */
  def asResult[T](value: Option[T], absentMsg: String = ""): Result[T] = {
    value match {
      case Some(v) => Success(value.get)
      case None => NotFoundError(absentMsg)
    }
  }

  /**
   * Check whether value is defined
   * @param value value to be checked
   * @param absentMsg message to be used when value is absent
   * @tparam T type of value
   * @return non-nullable result
   */
  def isPresent[T](value: Option[T], absentMsg: String = ""): Result[Boolean] = {
    value match {
      case Some(v) => Success(true)
      case None => NotFoundError(absentMsg)
    }
  }

  /**
   * Convert value into result
   * @param value value to be converted
   * @param falseMsg message to be used when value is false
   * @tparam T type of value
   * @return non-nullable result
   */
  def toResult[T](value: T, falseMsg: String = ""): Result[T] = {
    value match {
      case s: String => if (s.isEmpty) Fault[T](falseMsg) else Success[T](s.asInstanceOf[T])
      case true => Success(value)
      case false => Fault[T](falseMsg)
    }
  }

}

/**
 * Abstract result
 *
 * @author Michal Wronski
 * @since 1.0
 * @tparam T type of expected result
 */
abstract class Result[T] {

  /**
   * Check whether result is successful
   * @return true if result is OK, false otherwise
   */
  def isSuccess(): Boolean

  /**
   * Get value of result
   * @return non-nullable option
   */
  def get: Option[T]

}

sealed case class Success[T](value: T) extends Result[T] {
  override def isSuccess(): Boolean = true

  final def get = Some(value)

}

abstract class Error[T](errMsg: String) extends Result[T] {
  override final def isSuccess(): Boolean = false

  final def msg = errMsg

  final def get = None
  
}

sealed case class Fault[T](errorMsg: String) extends Error[T](errorMsg)

sealed case class ValidationError[T](errorMsg: String) extends Error[T](errorMsg)

sealed case class UnauthorizedError[T](errorMsg: String) extends Error[T](errorMsg)

sealed case class NotFoundError[T](errorMsg: String) extends Error[T](errorMsg)


