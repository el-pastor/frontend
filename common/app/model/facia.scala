package model

import org.joda.time.DateTime
import common.Edition

case class Config(
                   id: String,
                   contentApiQuery: Option[String] = None,
                   displayName: Option[String] = None,
                   href: Option[String] = None,
                   groups: Seq[String],
                   collectionType: Option[String])

object Config {
  def apply(id: String): Config = Config(id, None, None, None, Nil, None)
  def apply(id: String, contentApiQuery: Option[String], displayName: Option[String], `type`: Option[String]): Config
    = Config(id, contentApiQuery, displayName, `type`, Nil, None)
  def apply (id: String, displayName: Option[String]): Config
    = Config(id, None, displayName, None, Nil, None)
  def apply (id: String, displayName: Option[String], href: Option[String]): Config
    = Config(id, None, displayName, href, Nil, None)
}

case class Collection(curated: Seq[Content],
                      editorsPicks: Seq[Content],
                      mostViewed: Seq[Content],
                      results: Seq[Content],
                      displayName: Option[String],
                      href: Option[String],
                      lastUpdated: Option[String],
                      updatedBy: Option[String],
                      updatedEmail: Option[String]) extends implicits.Collections {

  lazy val items: Seq[Content] = (curated ++ editorsPicks ++ mostViewed ++ results).distinctBy(_.url)
}

object Collection {
  def apply(curated: Seq[Content]): Collection = Collection(curated, Nil, Nil, Nil, None, None, Option(DateTime.now.toString), None, None)
  def apply(curated: Seq[Content], displayName: Option[String]): Collection = Collection(curated, Nil, Nil, Nil, displayName, None, Option(DateTime.now.toString), None, None)
}

case class SeoData(
  id: String,
  section: Option[String],
  webTitle: Option[String],   //Always short, eg, "Reviews" for "tone/reviews" id
  title: Option[String],      //Long custom title entered by editors
  description: Option[String])

case class FaciaPage(
                   id: String,
                   seoData: SeoData,
                   collections: List[(Config, Collection)]) extends MetaData {

  override lazy val description: Option[String] = seoData.description

  override def section: String = seoData.section.getOrElse(defaultSection)
  override def analyticsName: String = s"GFE:$getContentType"
  override def webTitle: String = seoData.webTitle.getOrElse(defaultWebTitle)

  def defaultSection: String = ""
  def defaultWebTitle: String = ""

  lazy val getContentType: String =
    Edition.all.find(edition => id.endsWith(edition.id)) match {
      case Some(_) => "Network Front"
      case None    => "Section"
    }
}

object FaciaComponentName {
  def apply(config: Config, collection: Collection): String = {
    config.displayName.orElse(collection.displayName).map { title =>
      title.toLowerCase.replace(" ", "-")
    }.getOrElse("no-name")
  }
}
