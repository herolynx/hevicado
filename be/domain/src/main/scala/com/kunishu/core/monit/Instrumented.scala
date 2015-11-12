package com.kunishu.core.monit

import kamon.Kamon
import kamon.trace.Tracer

import scala.concurrent.{ExecutionContext, Future}

/**
 * Trait for gathering metrics on chosen object
 *
 * @author Michal Wronski
 */
trait Instrumented {

  /**
   * Gather metrics regarding given segment of code
   * @param name name of code segment
   * @param f block to be traced
   * @tparam A type of returned result by segment
   * @return result returned by segment code
   */
  final def segment[A](name: String)(f: => A): A = Tracer.currentContext.withNewSegment(name, "business-logic", "kamon") {
    f
  }

  /**
   * Gather metrics regarding given segment of code wrapped by future
   * @param name name of code segment
   * @param f future to be traced
   * @tparam A type of returned result by segment
   * @return traced future result
   */
  final def futureSegment[A](name: String)(f: => Future[A])(implicit ex: ExecutionContext): Future[A] = Tracer.currentContext.withNewAsyncSegment(name, "business-logic", "kamon") {
    f
  }

  final def counter(name: String) = Kamon.metrics.counter(name)

  final def minMaxCounter(name: String) = Kamon.metrics.minMaxCounter(name)

  final def histogram(name: String) = Kamon.metrics.histogram(name)

  //TODO
//  final def gauge(name: String) = Kamon.metrics.gauge(name)(Kamon.metrics.ga)

}
