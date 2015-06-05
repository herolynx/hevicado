import sbt._
import Keys._
import sbtassembly.AssemblyKeys._

object HevicadoBuild extends Build {

  import Resolvers._
  import BuildSettings._

  private val depCompileTest = "compile->compile;test->test"

  lazy val hevicado = Project(
    "hevicado",
    file("."),
    settings = buildSettings ++ Seq(
      test in assembly := {}
    )
  ).aggregate(
      moduleDomain,
      moduleIOStorage,
      moduleUsers,
      moduleChronos,
      moduleWeb
    )

  /* IO web */

  lazy val moduleWeb = Project(
    "io-web",
    file("io-web"),
    settings = moduleSettings("io-web") ++
      Seq(
        resolvers := projectResolvers,
        libraryDependencies ++= (
          GenericDependencies.commonDeps ++
            AkkaDependencies.allDeps ++
            SprayDependencies.allDeps
          )
      )
  ).dependsOn(
      moduleService,
      moduleIOStorage,
      moduleSecurity,
      moduleChronos,
      moduleUsers,
      moduleDomain
    )

  /* IO services */

  lazy val moduleService = Project(
    "io-service",
    file("io-service"),
    settings = moduleSettings("io-service") ++
      Seq(
        resolvers := projectResolvers,
        libraryDependencies ++= (
          GenericDependencies.commonDeps ++
            AkkaDependencies.allDeps
          )
      )
  ).dependsOn(
      moduleIOStorage,
      moduleSecurity,
      moduleUsers,
      moduleChronos,
      moduleDomain
    )

  lazy val moduleIOStorage = Project(
    "io-storage",
    file("io-storage"),
    settings = moduleSettings("io-storage") ++
      Seq(
        resolvers := projectResolvers,
        libraryDependencies ++= (
          GenericDependencies.commonDeps ++
            DbDependencies.allDeps
          )
      ),
    dependencies = Seq(moduleDomain % depCompileTest)
  ).dependsOn(
      moduleDomain,
      moduleSecurity,
      moduleUsers,
      moduleChronos
    )

  /* modules realizing use cases/features */

  lazy val moduleSecurity = Project(
    "security",
    file("security"),
    settings = moduleSettings("security") ++
      Seq(
        resolvers := projectResolvers,
        libraryDependencies ++= (
          GenericDependencies.commonDeps
          )
      ),
    dependencies = Seq(moduleDomain % depCompileTest)
  ) dependsOn (moduleDomain)

  lazy val moduleChronos = Project(
    "chronos",
    file("chronos"),
    settings = moduleSettings("chronos") ++
      Seq(
        resolvers := projectResolvers,
        libraryDependencies ++= (
          GenericDependencies.commonDeps
          )
      ),
    dependencies = Seq(moduleDomain % depCompileTest)
  ) dependsOn (moduleDomain)

  lazy val moduleUsers = Project(
    "users",
    file("users"),
    settings = moduleSettings("users") ++
      Seq(
        resolvers := projectResolvers,
        libraryDependencies ++= (
          GenericDependencies.commonDeps
          )
      ),
    dependencies = Seq(moduleDomain % depCompileTest)
  ) dependsOn (moduleDomain)


  lazy val moduleDomain = Project(
    "domain",
    file("domain"),
    settings = moduleSettings("domain") ++
      Seq(
        resolvers := projectResolvers,
        libraryDependencies ++= (
          GenericDependencies.commonDeps
          )
      )
  )

}