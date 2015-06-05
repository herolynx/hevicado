package com.kunishu.storage.test.data

import com.kunishu.storage.test.TestDBSetUp
import com.kunishu.test.data.UsersTestData._
import org.scalatest.{BeforeAndAfter, Suite}

/**
 * Data of test users
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait TestDBUsers extends TestDBSetUp {

  override def initData() = {
    val users = List(
      johnnyBravo,
      zbigniewReliga,
      pamelaAnderson,
      doctorQuin
    )
    initCollection(collectionName, users)
  }

}
