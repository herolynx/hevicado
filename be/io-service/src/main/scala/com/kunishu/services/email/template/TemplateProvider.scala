package com.kunishu.services.email.template

import java.io.StringWriter

import akka.actor.ActorLogging
import com.kunishu.services.config.ConfigProvider
import org.apache.velocity.app.{VelocityEngine}
import org.apache.velocity.runtime.RuntimeConstants
import org.apache.velocity.{Template, VelocityContext}
import ConfigProvider.config


/**
 * Template manager
 *
 * @author Michal Wronski
 * @since 1.2
 */
trait TemplateProvider {

  logger: ActorLogging =>

  /**
   * Compile template
   * @param name template name
   * @param variables states of variables
   * @return string template representation
   */
  def compileTemplate(name: String, variables: Map[String, _]): Option[String] =
    loadTemplate(name)
      .map(
        temp => {
          val context = new VelocityContext()
          for ((key, value) <- variables) {
            context.put(key, value)
          }
          val writer = new StringWriter()
          temp.merge(context, writer)
          writer.toString
        }
      )

  /**
   * Load template
   * @param name template name
   * @return non-nullable option
   */
  def loadTemplate(name: String): Option[Template] = {
    try {
      val engine = new VelocityEngine()
      val tptConfig = config.getConfig("mail.templates")
      engine.setProperty(RuntimeConstants.RESOURCE_LOADER, tptConfig.getString("resource-loaded"))
      engine.setProperty("classpath.resource.loader.class", tptConfig.getString("loaded-class"))
      engine.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, tptConfig.getString("loaded-path"))
      engine.setProperty(RuntimeConstants.FILE_RESOURCE_LOADER_CACHE, tptConfig.getString("cache"))
      engine.setProperty("file.resource.loader.modificationCheckInterval", tptConfig.getString("refresh")) //in seconds
      engine.init()
      val template = engine.getTemplate(name, tptConfig.getString("coding"))
      Some(template)
    } catch {
      case e: Throwable => {
        logger.log.warning("Template not found - name: {}, error: {}", name, e.getMessage)
        None
      }
    }
  }


}
