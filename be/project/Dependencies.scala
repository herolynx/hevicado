import sbt._

object Resolvers {

  val sunRepo = "Sun Maven2 Repo" at "http://download.java.net/maven/2"
  val sonatypeRelease = "Sonatype release" at "https://oss.sonatype.org/content/repositories/releases"
  val typeSafe = "Typesafe Repo" at "http://repo.typesafe.com/typesafe/releases/"

  val projectResolvers = Seq(sunRepo, sonatypeRelease, typeSafe)
}

object GenericDependencies {

  //time support
  val jodaTime = "joda-time" % "joda-time" % "2.4"
  val jodaConvert = "org.joda" % "joda-convert" % "1.2"

  //others
  val apacheCodec = "commons-codec" % "commons-codec" % "1.9"

  //testing
  val scalaTest = "org.scalatest" % "scalatest_2.10" % "2.2.1" % Test
  val scalaMock = "org.scalamock" % "scalamock_2.10" % "3.2.1" % Test
  val scalaMockSupport = "org.scalamock" %% "scalamock-scalatest-support" % "3.2.1" % Test

  val commonDeps = Seq(
    jodaTime,
    jodaConvert,
    apacheCodec,
    scalaTest,
    scalaMock,
    scalaMockSupport
  )
}

object DbDependencies {

  val mongoDB = "org.mongodb" %% "casbah" % "2.7.3"

  val allDeps = Seq(
    mongoDB
  )
}

object AkkaDependencies {

  val akkaVersion = "2.3.5"

  val akkaActor = "com.typesafe.akka" %% "akka-actor" % akkaVersion
  val akkaTestKit = "com.typesafe.akka" %% "akka-testkit" % akkaVersion % Test

  val mail = "javax.mail" % "mail" % "1.4.7"
  val velocity = "org.apache.velocity" % "velocity" % "1.7"

  val slf4j = "com.typesafe.akka" % "akka-slf4j_2.10" % akkaVersion
  val logback = "ch.qos.logback" % "logback-classic" % "1.1.3"

  val allDeps = Seq(
    akkaActor,
    mail,
    velocity,
    slf4j,
    logback,
    akkaTestKit
  )
}

object SprayDependencies {

  val sprayVersion = "1.3.1"

  //spray
  val sprayCan = "io.spray" % "spray-can" % sprayVersion
  val sprayRouting = "io.spray" % "spray-routing" % sprayVersion
  val sprayClient = "io.spray" % "spray-client" % sprayVersion
  val sprayTestKit = "io.spray" % "spray-testkit" % sprayVersion % "test"

  //JSON
  val sprayJson = "io.spray" %% "spray-json" % "1.2.6"

  val allDeps = Seq(
    sprayCan,
    sprayRouting,
    sprayClient,
    sprayTestKit,
    sprayJson
  )

}