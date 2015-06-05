package com.kunishu.model

/**
 * Published attributes of entities
 */
object EntityAttrs {

  val attId = "id"

}


/**
 * Basic entity
 *
 * @author Michal Wronski
 * @since 1.0
 */
abstract class Entity {

  import EntityAttrs.attId

  protected val map: Map[String, Any]

  /**
   * Get entity ID
   * @return id for existing entity, none for new one
   */
  final def id: Option[String] = map.get(attId).map(value => value.toString)

  /**
   * Get all attributes of given entity
   * @return non-nullable map with property name-property value entries
   */
  final def attributes: Map[String, Any] = map

}

/**
 * Basic entity that belongs to chosen user
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait Owner {

  /**
   * Get ID of owner
   * @return non-nullable string
   */
  def ownerId: String

}
