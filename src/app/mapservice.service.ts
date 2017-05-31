import { Injectable } from '@angular/core';
import { MapsAPILoader } from 'angular2-google-maps/core'
import { GoogleMapsAPIWrapper } from 'angular2-google-maps/core';
declare var google: any;//Google maps  imported
@Injectable()
export class MapserviceService {
  

  constructor() { }

 //Generates a cell by identfying the 6 vertex's lat, lng based on EOF offset
  generateCell(distance, lat, lng) {
    console.log(distance, lat, lng)
    var coordinates = []
    var i: number
    const step = 60
    var bearing = 0// starting north clockwise 0 degrees
    var point = new google.maps.LatLng(lat, lng);
    const p = this.EOffsetBearing(point, distance, bearing)
    for (i = 0; i < 7; i++) {// finding 6 vertex
      var cods = this.EOffsetBearing(point, distance, bearing)
      //console.log("cods", bearing, cods.lat(), cods.lng())
      coordinates.push({ lat: cods.lat(), lng: cods.lng() })
      bearing += step
    }
    const arr = coordinates.slice(0)
    coordinates = []
    return arr

   

  }

// returns lat,lng of a points which is x distance , y bearing from a point with lat, lng
  EOffsetBearing(point, dist, bearing) {
    var latConv = google.maps.geometry.spherical.computeDistanceBetween(point, new google.maps.LatLng(point.lat() + 0.1, point.lng())) * 10;
    var lngConv = google.maps.geometry.spherical.computeDistanceBetween(point, new google.maps.LatLng(point.lat(), point.lng() + 0.1)) * 10;
    var lat = dist * Math.cos(bearing * Math.PI / 180) / latConv;
    var lng = dist * Math.sin(bearing * Math.PI / 180) / lngConv;
   // console.log("inaiwde")
    return new google.maps.LatLng(point.lat() + lat, point.lng() + lng)
  }

// return LatLng
  returnPoint(lat, lng) {
    return new google.maps.LatLng(lat, lng);
  }


  /*This is to sort the difference in lat, lng arising out of EOFOffset method
  comaring if the two LatLng points hav a difference of <20 m , it's the same point*/
  
  distanceLessThanThreshold(p1, points):Boolean {
    console.log("inside distanceLessThanThreshold()")
    var point1 = this.returnPoint(p1.centre.lat, p1.centre.lng)
    var value = 0
    //console.log("points", points, point1)
    for (var point of points) {
      //console.log(point)
      value = google.maps.geometry.spherical.computeDistanceBetween(point1, point);
      //console.log("difference in meter from distanceLessThanThreshold for :",p1.id,value)
      if (value <= 50)// 50 metres or less, the points belong to the same spot
        return true
    }
    return false
  }


  // To avoid overwirting a cell over existing one
  isAlreadyPlotted(point, omgpolygons): Boolean {
    console.log("Inside isAlreadyPlotted()")
    for (var omgpolygon of omgpolygons) {
      var transformedPloygon = new google.maps.Polygon({ paths: omgpolygon.sides })
      if (google.maps.geometry.poly.containsLocation(point, transformedPloygon))
        return true
    }
    return false
  }

}