package com.kunishu.storage

import com.kunishu.model.EntityAttrs

/**
 * Common storage filters
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait StorageFilters {

  /**
   * Filter for removing model ID so native storage ID can be used
   * @param attr attribute name
   * @return true if attributes should be filtered out, false otherwise
   */
  protected def noModelIdFilter(attr: String): Boolean = !attr.equals(EntityAttrs.attId)

}
