import sbt._

object Resolvers {

  val sunRepo = "Sun Maven2 Repo" at "http://download.java.net/maven/2"
  val sonatypeRelease = "Sonatype release" at "https://oss.sonatype.org/content/repositories/releases"
  val typeSafe = "Typesafe Repo" at "http://repo.typesafe.com/typesafe/releases/"

  val projectResolvers = Seq(sunRepo, sonatypeRelease, typeSafe)
}

object GenericDependencies {

  val logging = "com.typesafe.scala-logging" %% "scala-logging-slf4j" % "2.1.2"

  //time support
  val jodaTime = "joda-time" % "joda-time" % "2.8.2"
  val jodaConvert = "org.joda" % "joda-convert" % "1.8.1"

  //others
  val apacheCodec = "commons-codec" % "commons-codec" % "1.10"

  //testing
  val scalaTest = "org.scalatest" %% "scalatest" % "2.2.5" % Test
  val scalaMock = "org.scalamock" %% "scalamock-core" % "3.2.2" % Test
  val scalaMockSupport = "org.scalamock" %% "scalamock-scalatest-support" % "3.2.2" % Test

  val commonDeps = Seq(
    logging,
    jodaTime,
    jodaConvert,
    apacheCodec,
    scalaTest,
    scalaMock,
    scalaMockSupport
  )
}

object DbDependencies {

  val mongoDB = "org.mongodb" %% "casbah" % "2.8.2"

  val allDeps = Seq(
    mongoDB
  )
}

object AkkaDependencies {

  val akkaVersion = "2.4.0"

  val akkaActor = "com.typesafe.akka" %% "akka-actor" % akkaVersion
  val akkaTestKit = "com.typesafe.akka" %% "akka-testkit" % akkaVersion % Test

  val mail = "javax.mail" % "mail" % "1.4.7"
  val velocity = "org.apache.velocity" % "velocity" % "1.7"

  val slf4j = "com.typesafe.akka" %% "akka-slf4j" % akkaVersion
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

  val sprayVersion = "1.3.3"

  //spray
  val sprayCan = "io.spray" %% "spray-can" % sprayVersion
  val sprayRouting = "io.spray" %% "spray-routing" % sprayVersion
  val sprayClient = "io.spray" %% "spray-client" % sprayVersion
  val sprayTestKit = "io.spray" %% "spray-testkit" % sprayVersion % Test

  //JSON
  val sprayJson = "io.spray" %% "spray-json" % "1.3.2"

  val allDeps = Seq(
    sprayCan,
    sprayRouting,
    sprayClient,
    sprayTestKit,
    sprayJson
  )

}

object MonitoringDependencies {

  val kamonVersion = "0.5.2"
  val aspectVersion = "1.8.7"

  val kamonCore = "io.kamon" %% "kamon-core" % kamonVersion
  val kamonScala = "io.kamon" %% "kamon-scala" % kamonVersion
  val kamonSystem = "io.kamon" %% "kamon-system-metrics" % kamonVersion
  val kamonLogReporter = "io.kamon" %% "kamon-log-reporter" % kamonVersion

  val kamonAkka = "io.kamon" %% "kamon-akka" % kamonVersion

  val kamonSpray = "io.kamon" %% "kamon-spray" % kamonVersion
  val kamonStatsd = "io.kamon" %% "kamon-statsd" % kamonVersion

  val aspectjrt = "org.aspectj" % "aspectjrt" % aspectVersion
  val aspectWeaver = "org.aspectj" % "aspectjweaver" % aspectVersion

  val coreDeps = Seq(
    kamonCore,
    kamonScala,
    aspectjrt,
    aspectWeaver
  )

  val serviceDeps = coreDeps ++ Seq(
    kamonAkka
  )

  val webDeps = serviceDeps ++ Seq(
    kamonSpray,
    kamonStatsd,
    kamonSystem,
    kamonLogReporter
  )

}