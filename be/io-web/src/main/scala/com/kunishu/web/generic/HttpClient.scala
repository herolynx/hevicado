package com.kunishu.web.generic

import com.kunishu.services.config.ServiceProvider
import spray.client.pipelining._
import spray.http.{HttpResponse, HttpRequest}

import scala.concurrent.Future

/**
 * HTTP client for sending request to 3rd party services
 *
 * @author Michal Wronski
 */
object HttpClient {

  implicit val system = ServiceProvider.system

  import system.dispatcher

  private val pipeline: HttpRequest => Future[HttpResponse] = sendReceive

  /**
   * Send HTTP GET request
   * @param url service address
   * @return future HTTP response
   */
  def get(url: String): Future[HttpResponse] = pipeline(Get(url))

}
