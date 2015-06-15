package com.kunishu.core.processing

object ResultChain {

  /**
   * Start chain
   * @tparam T type of final result
   * @return non-nullable instance
   */
  def chainOf[T] = new ResultChain[T](Success[T](Nil.asInstanceOf[T]))

}

/**
 * Chain of steps composed of pre-checks and final computation.
 * If one of pre-checks ends up with error then whole chain is broken.
 *
 * @author Michal Wronski
 * @since 1.0
 */
sealed class ResultChain[T](prevResult: Result[T]) {

  /**
   * Do the check
   * @param f verification function
   * @return non-nullable chain
   */
  def check(f: Function0[Result[T]]): ResultChain[T] = {
    prevResult match {
      case Success(v) => new ResultChain(f.apply())
      case _ => return this
    }
  }

  /**
   * Do final computation
   * @param f function
   * @return result of chain computation
   */
  def then(f: Function0[Result[T]]): Result[T] = {
    prevResult match {
      case Success(v) => f.apply()
      case _ => return prevResult
    }
  }


}
