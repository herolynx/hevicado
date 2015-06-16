import sbt._
import Keys._
import sbtassembly.AssemblyKeys._

/**
 * Build settings
 */
object BuildSettings {

  val buildOrganization = "com.kunishu"
  val buildVersion = "1.3.0"
  val buildScalaVersion = "2.10.4"

  /**
   * Settings
   */
  val buildSettings = Seq(
    organization := buildOrganization,
    version := buildVersion,
    scalaVersion := buildScalaVersion,
    shellPrompt := ShellPrompt.buildShellPrompt
  ) ++
    Seq(
      test in assembly := {}
    )

  /**
   * Create settings for chosen module
   * @param module module name
   * @return non-nullable sequence
   */
  def moduleSettings(module: String) = Seq(
    organization := buildOrganization + "." + module,
    version := buildVersion,
    scalaVersion := buildScalaVersion,
    shellPrompt := ShellPrompt.buildShellPrompt
  ) ++
    Seq(
      test in assembly := {}
    )
}
