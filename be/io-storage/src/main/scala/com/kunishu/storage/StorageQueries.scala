package com.kunishu.storage

import com.kunishu.model.user.AnyUser
import com.kunishu.storage.conversion.StorageConversions._
import com.mongodb.casbah.MongoCollection
import com.mongodb.casbah.commons.MongoDBObject
import org.bson.types.ObjectId
import com.mongodb.casbah.Imports._

/**
 * Common queries related stuff
 *
 * @author Michal Wronski
 * @since
 */
trait StorageQueries {

  protected val attId = "_id"

  /**
   * Get value as DB ID
   * @param value value to be converted
   * @return non-nullable instance
   */
  protected final def asId(value: String) = new ObjectId(value)

  /**
   * Query for finding results by ID
   * @param id ID
   * @return non-nullable query criteria
   */
  protected def queryById(id: String) = MongoDBObject(attId -> asId(id))

  /**
   * Query for finding results by user
   * @param user user who should own searched stuff
   * @return non-nullable query criteria
   */
  protected final def queryByUserId(user: AnyUser) = MongoDBObject(attId -> new ObjectId(user.id.get.toString))

  /**
   * Create name of attribute in sub-document
   * @param attrs attributes that creates path to sub-document
   * @return non-nullable string
   */
  protected final def subAttribute(attrs: String*) = attrs.mkString(".")

  /**
   * Create projection without given attribute
   * @param attr attribute to be excluded
   * @return non-nullable projection
   */
  protected final def without(attr: String) = MongoDBObject(attr -> false)

  /**
   * Find single entity by ID
   * @param repo repository where entity is stored
   * @param id ID of entity
   * @return non-nullable option of object map
   */
  protected final def findOne(repo: MongoCollection, id: String) =
    repo.
      findOne(queryById(id)).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap))

  /**
   * Find by given criteria
   * @param repo repository where results can be found
   * @param query search criteria
   * @return non-nullable option of object maps
   */
  protected final def find(repo: MongoCollection, query: MongoDBObject) =
    repo.
      find(query).
      map(doc => doc.asInstanceOf[java.util.Map[String, Any]]).
      map(javaMap => normalizeMap(javaMap))

}
