package com.kunishu.storage.test

import com.kunishu.storage.StorageFilters
import com.kunishu.storage.conversion.StorageConversions._
import com.mongodb.casbah.Imports._
import com.kunishu.model.Entity
import org.scalatest.{BeforeAndAfter, Suite}

/**
 * Set-up of data-base before testing and cleaning up after test execution.
 * Each set-up embraces insertion of sample data for testing purposes.
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait TestDBSetUp extends StorageFilters with Suite with BeforeAndAfter {

  val collectionName: String
  val db: MongoDB

  protected def initData()

  protected def initCollection[T <: Entity](collectionName: String, entities: Seq[T]) = {
    val collection = db(collectionName)
    for (entity <- entities) {
      val dbEntity = new MongoDBObject(denormalize(entity.attributes))
      collection.insert(dbEntity)
    }
  }

  protected def cleanData() = {
    db(collectionName).drop()
  }


  before {
    cleanData()
    initData()
  }

  after {
    cleanData()
  }

}
