import sbt._
import Keys._
import sbtassembly.AssemblyKeys._
import com.typesafe.sbt.SbtAspectj.{AspectjKeys, Aspectj, aspectjSettings}
import sbtassembly.{MergeStrategy}

/**
 * Build settings
 */
object BuildSettings {

  val buildOrganization = "com.kunishu"
  val buildVersion = "1.3.0"
  val buildScalaVersion = "2.11.7"

  /**
   * Settings
   */
  val buildSettings = aspectjSettings ++
    commonSettings ++
    assemblySettings ++
    Seq(
      organization := buildOrganization
    )

  /**
   * Create settings for chosen module
   * @param module module name
   * @return non-nullable sequence
   */
  def moduleSettings(module: String) = aspectjSettings ++
    commonSettings ++
    assemblySettings ++
    Seq(
      organization := buildOrganization + "." + module
    )

  private def commonSettings = Seq(
    version := buildVersion,
    scalaVersion := buildScalaVersion,
    shellPrompt := ShellPrompt.buildShellPrompt,
    javaOptions <++= AspectjKeys.weaverOptions in Aspectj,
    fork in run := true
  )

  private def assemblySettings = Seq(
    test in assembly := {},
    assemblyMergeStrategy in assembly := {
      case "META-INF/aop.xml" => aopMerge
      case x =>
        val oldStrategy = (assemblyMergeStrategy in assembly).value
        oldStrategy(x)
    }
  )

  private val aopMerge: MergeStrategy = new MergeStrategy {
    val name = "aopMerge"

    import scala.xml._
    import scala.xml.dtd._

    def apply(tempDir: File, path: String, files: Seq[File]): Either[String, Seq[(File, String)]] = {
      val dt = DocType("aspectj", PublicID("-//AspectJ//DTD//EN", "http://www.eclipse.org/aspectj/dtd/aspectj.dtd"), Nil)
      val file = MergeStrategy.createMergeTarget(tempDir, path)
      val xmls: Seq[Elem] = files.map(XML.loadFile)
      val aspectsChildren: Seq[Node] = xmls.flatMap(_ \\ "aspectj" \ "aspects" \ "_")
      val weaverChildren: Seq[Node] = xmls.flatMap(_ \\ "aspectj" \ "weaver" \ "_")
      val options: String = xmls.map(x => (x \\ "aspectj" \ "weaver" \ "@options").text).mkString(" ").trim
      val weaverAttr = if (options.isEmpty) Null else new UnprefixedAttribute("options", options, Null)
      val aspects = new Elem(null, "aspects", Null, TopScope, false, aspectsChildren: _*)
      val weaver = new Elem(null, "weaver", weaverAttr, TopScope, false, weaverChildren: _*)
      val aspectj = new Elem(null, "aspectj", Null, TopScope, false, aspects, weaver)
      XML.save(file.toString, aspectj, "UTF-8", xmlDecl = false, dt)
      IO.append(file, IO.Newline.getBytes(IO.defaultCharset))
      Right(Seq(file -> path))
    }
  }


}
