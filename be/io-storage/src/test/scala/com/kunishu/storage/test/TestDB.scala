package com.kunishu.storage.test

import com.mongodb.casbah.Imports._

/**
 * Configuration of DB for testing purposes
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait TestDB {

  val mongoClient = MongoClient("localhost", 27017)
  val db = mongoClient("kunishuTestDB")

}
