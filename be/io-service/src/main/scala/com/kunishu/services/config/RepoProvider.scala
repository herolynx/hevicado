package com.kunishu.services.config

import com.kunishu.chronos.io.CalendarRepo
import com.kunishu.security.io.AuthenticationRepo
import com.kunishu.storage.chronos.CalendarStorage
import com.kunishu.storage.security.AuthStorage
import com.kunishu.storage.users.UserStorage
import com.kunishu.users.io.UserRepo
import com.mongodb.casbah.Imports._
import org.joda.time.DateTimeZone
import ConfigProvider.config

/**
 * Repository provider
 *
 * @author Michal Wronski
 * @since 1.0
 */
object RepoProvider {

  DateTimeZone.setDefault(DateTimeZone.UTC)

  private val repoConfig = config.getConfig("repo")

  private val mongoClient = MongoClient(
    repoConfig.getString("host"),
    repoConfig.getInt("port")
  )
  private val dbClient = mongoClient(
    repoConfig.getString("name")
  )

  def securedRepo: AuthenticationRepo = new Object() with AuthStorage {
    protected override val collectionName = repoConfig.getString("collections.tokens")
    protected override val db = dbClient
    protected override val users = db(repoConfig.getString("collections.users"))
  }

  def calendarRepo: CalendarRepo = new Object() with CalendarStorage {
    protected override val collectionName = repoConfig.getString("collections.calendar")
    protected override val db = dbClient
  }

  def userRepo: UserRepo = new Object() with UserStorage {
    protected override val collectionName = repoConfig.getString("collections.users")
    protected override val db = dbClient
  }

}
