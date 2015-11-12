package com.kunishu.web.directives

import spray.http.HttpMethods._
import spray.http._
import spray.routing._

/**
 * CORS related directives
 */
trait CorsDirectives {

  this: HttpService =>

  /**
   * Set chosen CORS header for in-coming request
   * @param origin optional source of current request
   * @return routing rule chain
   */
  private def respondWithCorsHeaders(origin: String = null) =
    respondWithHeaders(
      HttpHeaders.`Access-Control-Allow-Origin`(if (origin != null) SomeOrigins(List(origin)) else AllOrigins),
      HttpHeaders.`Access-Control-Allow-Credentials`(true),
      HttpHeaders.`Access-Control-Allow-Methods`(GET, POST, PUT, DELETE, OPTIONS),
      HttpHeaders.`Access-Control-Allow-Headers`("" +
        "X-Requested-With,  Cache-Control, Cookie, Content-Type," +
        "Accept, Accept-Encoding, Accept-Language, Access-Control-Allow-Credentials, " +
        "Authorization, WithCredentials"
      ),
      HttpHeaders.`Access-Control-Max-Age`(3600)
    )

  /**
   * Handle CORS request
   * @param route  next routing rule
   * @return routing rule chain
   */
  private def handleRequest(origin: String = null)(route: Route) = {
    respondWithCorsHeaders() {
      options {
        complete(StatusCodes.OK, "CORS supported");
      } ~ route
    }
  }

  /**
   * Filter request based on in-coming request
   * @param origins allowed origins from which request can be handled
   * @param route next routing rule
   * @return routing rule chain
   */
  final def corsFilter(origins: List[String])(route: Route) = {
    if (origins.contains("*")) {
      handleRequest()(route)
    } else {
      optionalHeaderValueByName("Origin") {
        case None => route
        case Some(clientOrigin) => {
          if (origins.contains(clientOrigin)) {
            handleRequest(clientOrigin)(route)
          } else {
            complete(StatusCodes.Forbidden, "Invalid origin: " + clientOrigin)
          }
        }
      }
    }
  }
}

