package com.kunishu.storage

import com.kunishu.core.monit.Instrumented
import com.mongodb.casbah.Imports._
import com.mongodb.casbah.commons.MongoDBObject
import com.kunishu.model.Entity
import com.kunishu.storage.conversion.StorageConversions.denormalize

/**
 * Basic service for managing chosen storage areas
 *
 * @author Michal Wronski
 * @since 15.11.14.
 *
 */
trait Storage[T <: Entity] extends DocumentStorage with StorageFilters with StorageQueries with Instrumented {

  /**
   * Create new entity
   * @param entity entity to be created
   * @return ID of newly created entity
   */
  final def create(entity: T): String = segment("create") {
    val dbEntity = new MongoDBObject(denormalize(entity.attributes.filterKeys(noModelIdFilter)))
    repo.insert(dbEntity)
    dbEntity.getOrElse(attId, "").toString
  }

  /**
   * Update entity
   * @param entity entity to be updated
   * @return true if entity was updated, false otherwise
   */
  final def update(entity: T): Boolean = segment("update") {
    val dbEntity = $set(denormalize(entity.attributes).toSeq: _*)
    repo.
      update(queryById(entity.id.get.toString), dbEntity, upsert = false, multi = false).
      getN == 1
  }

  /**
   * Delete entity
   * @param id entity to be deleted
   * @return true if entity was deleted, false otherwise
   */
  final def delete(id: String): Unit = segment("delete") {
    repo.remove(queryById(id))
  }

}
