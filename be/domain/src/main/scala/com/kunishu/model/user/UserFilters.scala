package com.kunishu.model.user

/**
 * Filters related with user data
 *
 * @author Michal Wronski
 * @since 1.0
 */
trait UserFilters {

  import UserAttrs._

  /**
   * Function for converting location into flat address criteria
   * @param location location to be converted
   * @return non-nullable sequence
   */
  def location2Address(location: Location): Seq[String] =
    (location.
      attributes.
      get(attAddress).
      get.
      asInstanceOf[Map[String, String]] ++
      Map(attName -> location.name)
      ).
      values.
      toSeq

  /**
   * Function for converting location into flat specializations criteria
   * @param location location to be converted
   * @return non-nullable sequence
   */
  def locationToSpecializations(location: Location): Seq[String] =
    location.
      attributes.
      get(attSpecializations).
      map(specs => specs.asInstanceOf[List[String]]).
      getOrElse(List[String]()).
      toSeq

  /**
   * Filter locations
   * @param flatLocation function for flatting values of location
   * @param user user which locations should be filtered out
   * @param filter filter
   * @return new instance of user with filtered locations
   */
  def filterLocation(flatLocation: (Location) => Seq[String])(user: AnyUser, filter: (String) => Boolean): AnyUser =
    user match {
      case User(_) => user

      case Doctor(_) => filterDoctorLocation(flatLocation)(user.asInstanceOf[Doctor], filter)
    }

  /**
   * Filter locations
   * @param flatLocation function for flatting values of location
   * @param doctor doctor which locations should be filtered out
   * @param filter filter
   * @return new instance of doctor with filtered locations
   */
  private def filterDoctorLocation(flatLocation: (Location) => Seq[String])(doctor: Doctor, filter: (String) => Boolean): Doctor = {
    val locations = scala.collection.mutable.ListBuffer[Map[String, Any]]()
    for (location <- doctor.locations) {
      if (flatLocation(location).filter(filter).nonEmpty) {
        locations += location.attributes
      }
    }
    new Doctor(
      doctor.attributes.filterNot(attr => attr.equals(attLocations)) ++
        Map(attLocations -> locations.toList)
    )
  }

}
