package com.kunishu.storage

import com.mongodb.casbah.Imports._
import com.mongodb.casbah.commons.conversions.scala.{RegisterConversionHelpers, RegisterJodaTimeConversionHelpers}
import com.mongodb.casbah.commons.conversions.scala._

/**
 * Storage for single type of documents
 *
 * @author Michal Wronski
 * @since 1.1
 */
trait DocumentStorage {

  RegisterJodaTimeConversionHelpers()
  RegisterConversionHelpers()

  protected val db: MongoDB
  protected val collectionName: String

  /**
   * Get area managed by given storage
   * @return non-nullable collection
   */
  lazy val repo: MongoCollection = db(collectionName)

}
