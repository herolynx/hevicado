package com.kunishu.web.parsing

import com.kunishu.core.date.Date._
import com.kunishu.model.Entity
import spray.json._
import DefaultJsonProtocol._

/**
 * Parser responsible for transforming model according to used storage
 */
object StorageModelParser {

  /**
   * Convert entity into JSON
   * @param entity entity to be converted
   * @tparam T type of entity
   * @return non-nullable JSON representation
   */
  def toJson[T <: Entity](entity: T): String = AnyJsonFormat.write(entity).toString

  /**
   * Convert entities into JSON
   * @param entities entities to be converted
   * @tparam T type of entity
   * @return non-nullable JSON representation
   */
  def toJson[T <: Entity](entities: Seq[T]): String = AnyJsonFormat.write(entities).toString

  /**
   * Convert map into JSON
   * @param map map to be converted
   * @tparam T type of entity
   * @return non-nullable JSON representation
   */
  def toJson[T <: Entity](map: Map[String, Any]): String = AnyJsonFormat.write(map).toString

  /**
   * Convert JSON into map representation
   * @param json json to be parsed
   * @return non-nullable map
   */
  def fromJson(json: String): Map[String, Any] = {
    AnyJsonFormat.read(json.parseJson) match {
      case m: Map[String, Any] => m
      case x => throw new RuntimeException("Couldn't parse JSON - value: " + x + ", JSON: " + json)
    }
  }

  implicit object AnyJsonFormat extends JsonFormat[Any] {

    def write(x: Any) = x match {
      case e: Entity => write(e.attributes)
      case n: Int => JsNumber(n)
      case d: Double => JsNumber(d)
      case s: String => JsString(s)
      case x: Seq[Any] => seqFormat[Any].write(x)
      case m: Map[String, Any] => mapFormat[String, Any].write(m)
      case b: Boolean if b == true => JsTrue
      case b: Boolean if b == false => JsFalse
      case d: java.util.Date => JsString(dateFormatter.print(d.getTime))
      case d: org.joda.time.DateTime => JsString(dateFormatter.print(d))
      case x => serializationError("Do not understand object of type " + x.getClass.getName)
    }

    def read(value: JsValue) = value match {
      case JsNumber(n) => n.intValue()
      case JsString(s) => normalizeValue(s)
      case a: JsArray => listFormat[Any].read(value).map(value => normalizeValue(value))
      case o: JsObject => mapFormat[String, Any].read(value).mapValues(value => normalizeValue(value))
      case JsTrue => true
      case JsFalse => false
      case x => deserializationError("Do not understand how to deserialize " + x)
    }

    private def normalizeValue(value: Any): Any = {
      if (value.isInstanceOf[String]) {
        value.toString.matches(dateTimePattern) match {
          case true => return toDate(value.toString)
          case false => return value
        }
      }
      return value
    }

  }

}

