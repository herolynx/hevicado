package com.kunishu.storage

import com.kunishu.model.Entity
import org.scalatest.{Matchers, GivenWhenThen, FunSpec}

/**
 * Test cases related with basic access to data
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait StorageTest[E <: Entity] extends FunSpec with GivenWhenThen with Matchers
with Storage[E] {

  /**
   * Create sample entity for testing purposes
   * @return non-nullable entity
   */
  def testEntity: E

  /**
   * Modify entity
   * @param entity entity to be modified
   * @param id ID of entity
   * @param attributes attributes to be added
   * @return new instance of entity
   */
  def modifyEntity(entity: E, id: String, attributes: Map[String, Any]): E

  def get(id: String): Option[E]

  describe("Basic access storage: " + testEntity.getClass) {

    it("Should create new entity") {
      Given("any entity")
      val entity = testEntity

      When("creating new entity")
      val entityId = create(entity)

      Then("ID of newly created instance is returned")
      entityId should not be (null)
      And("entity is readbale")
      val dbEntity = get(entityId)
      dbEntity.isDefined should be(true)
    }

    it("Should update entity") {
      Given("entity exists")
      val entity = testEntity
      val entityId = create(entity)
      entityId should not be (null)

      When("updating entity")
      val changedEntity = modifyEntity(entity, entityId, Map("newAtt" -> "newValue"))
      val updated = update(changedEntity)

      Then("changes are saved")
      updated should be(true)
      get(entityId).get.attributes.get("newAtt").get.toString should be("newValue")
    }

    it("Should delete entity") {
      Given("entity exists")
      val entity = testEntity
      val entityId = create(entity)
      entityId should not be (null)

      When("deleting entity")
      delete(entityId)

      Then("entity is deleted")
      get(entityId).isDefined should be(false)
    }

  }

}
