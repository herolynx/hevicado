package com.kunishu.storage.conversion

import com.kunishu.model.EntityAttrs
import org.bson.types.ObjectId

import scala.collection.JavaConversions._
import scala.collection.mutable.ArrayBuffer

/**
 * Functions for converting storage data into plain domain model
 *
 * @author Michal Wronski
 * @since 1.0
 */
object StorageConversions {

  private val mapping = Map(("_id" -> "id"))

  /**
   * Normalize map and its entries into scala types
   * @param javaMap map to be converted
   * @tparam U type of map
   * @return non-nullable instance
   */
  def normalizeMap[U <: java.util.Map[String, Any]](javaMap: U): Map[String, Any] = {
    val map = scala.collection.mutable.Map[String, Any]()
    for ((key, value) <- javaMap) {
      val column = mapping.get(key)
      map(column.getOrElse(key)) = normalizeAny(value)
    }
    map.toMap
  }

  /**
   * Normalize list and its values into scala types
   * @param javaList list to be converted
   * @tparam U type of list
   * @return non-nullable instance
   */
  private def normalizeList[U <: java.util.List[Any]](javaList: U): Seq[Any] = {
    val list = scala.collection.mutable.ArrayBuffer[Any]()
    for (value <- javaList) {
      list += normalizeAny(value)
    }
    list.toList
  }

  /**
   * Normalize value into scala type
   * @param value value to be converted
   * @return non-nullable instance
   */
  def normalizeAny(value: Any): Any = {
    value match {
      case id: ObjectId => id.toString
      case map: java.util.Map[String, Any] => normalizeMap(map)
      case list: java.util.List[Any] => normalizeList(list)
      case unknown => unknown
    }
  }

  /**
   * Denormalize map to storage representation
   * @param map map to be denormalized
   * @return new instance of map
   */
  def denormalize(map: Map[String, Any]): Map[String, Any] = {
    val dbMap = scala.collection.mutable.Map[String, Any]()
    if (!map.containsKey(EntityAttrs.attId)) {
      //assign ID even to sub-documents
      dbMap.put("_id", new ObjectId())
    }
    for ((key, value) <- map) {
      if (key.equals(EntityAttrs.attId)) {
        dbMap.put("_id", new ObjectId(value.toString))
      } else {
        dbMap.put(key, denormalizeAny(value))
      }
    }
    dbMap.toMap
  }

  /**
   * Denormalize value storage representation
   * @param value value be denormalized
   * @return new instance
   */
  private def denormalizeAny(value: Any): Any = {
    value match {
      case map: Map[String, Any] => denormalize(map)
      case seq: Seq[Any] => denormalizeList(seq)
      case _ => value
    }
  }

  /**
   * Denormalize values storage representation
   * @param seq values be denormalized
   * @return new instance
   */
  private def denormalizeList(seq: Seq[Any]): Seq[Any] = {
    val list = scala.collection.mutable.ArrayBuffer[Any]()
    for (value <- seq) {
      list += denormalizeAny(value)
    }
    list.toSeq
  }

}
