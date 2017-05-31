import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { MapserviceService } from '../mapservice.service'
//import {DialogModule} from 'primeng/primeng'
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';
@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.css']
})
export class MapDisplayComponent implements OnInit {


  OMGpolygons: Array<any>
  lat: number = -33.824348;// start positions
  lng: number = 151.016885;
  zoom = 14
  paths
  strokeColor = "#000000"//, 1, 1, "#00ff00", 0.5
  strokeWeight = .25
  fillColor = "#00ff00"
  fillOpacity = 0.15
  geodisic = true
  counter = 0  // TODO This will go, once we have UUID in place.
  
 
 
  constructor(private mapService: MapserviceService, overlay: Overlay, vcRef: ViewContainerRef, public modal: Modal) {
    overlay.defaultViewContainer = vcRef;
  }



  ngOnInit() {
    this.paths = []
    this.OMGpolygons = new Array<any>()

  }



  mapClicked(obj) {
    console.log("mapclicked !!!")
    this.lat = obj.coords.lat
    this.lng = obj.coords.lng
  }




  /** Invoked on user hitting the create button on the map */
  createCell(distance, lat, lng) {
    console.log("creating cell...", distance)
    // this.mapService.generateCell
    //var lat=this.mapService.returnNumber(latin,6)
    //var lng=this.mapService.returnNumber(lngin,6)
    var sides = this.mapService.generateCell(distance, lat, lng)

    // FIND NEIGHBOURS
    // best way is to find the 6 points(centres of other cells) using centre as reference for current cell.
    var newPoint = this.mapService.returnPoint(lat, lng);
    var centrePoints = new Array<any>()
    var i
    var bearing = 30  // 0 degress is North
    // stow them in the centrePoints array
    for (i = 0; i < 6; i++) {
      centrePoints.push(this.mapService.EOffsetBearing(newPoint, distance * 3 ** .5, bearing))
      bearing += 60
    }
 
    
   
    

    /**compare the centres of each OMGPolygon with the centrePoints array. if distance is
    less tha or equal to 20/50 m, assume the points are same, in that case store ids of the negihbouring
    cells in the neighbours array*/
    var indexStore = []
    var neighbours = this.OMGpolygons.filter(y => {
      if (this.mapService.distanceLessThanThreshold(y, centrePoints)) {
        var foundIndex = this.OMGpolygons.findIndex(z => z.id == y.id)
        indexStore.push(foundIndex)
        return true
      }
      return false

    }).map(z => z.id)

    //create the new OMGPolygon object
    var ompg = {
      id: this.counter,
      distance: distance,
      color: "blue",
      centre: { lat: lat, lng: lng },
      sides: sides,
      neighbours: neighbours
    }
     console.log("ompg object:",ompg)
    /** We also need to update the already existing cells ,
     *  since their neighbour have also changed. */
   
    var j = 0
    for (j = 0; j < indexStore.length; j++) {
      this.OMGpolygons[indexStore[j]].neighbours.push(ompg.id)
    }
    //console.log(indexStore)
    this.OMGpolygons.push(ompg)
    this.counter += 1 // ids of each cell is incremented
    console.log("OMGPOlygons", this.OMGpolygons)
    //this.paths=this.mapService.generateCell(distance,this.lat,this.lng)
    /* this.paths=[{lat:-33.82278907275145,lng:151.01864348403512},
      {lat:-33.82434500046476,lng:151.01993402220467},
      {lat:-33.825615713002996,lng:151.01885269273146},
      {lat:-33.82250385757637,lng:151.01669003378527},
      {lat:-33.824059785289684,lng:151.01560870431206},
      {lat:-33.82250385757637,lng:151.01669003378527},
      {lat:-33.82250385757637,lng:151.01885269273146}
      ]*/
  }



/** creates an adjacent cell on the North East side of the clicked cell */
  polygonClicked(omgpolygon) {
    console.log("polygon clicked!!!", omgpolygon)
    //LatLng returned 
    var newPoint = this.mapService.returnPoint(omgpolygon.centre.lat, omgpolygon.centre.lng);
  
   // centre of new hexagon cell is calculated. NE 30 degrees
    var calculatedPoint = this.mapService.EOffsetBearing(newPoint, (omgpolygon.distance) * 3 ** .5, 30)
   
   // check if a cell already exists in that area
    if (this.mapService.isAlreadyPlotted(calculatedPoint, this.OMGpolygons)) {
      console.log("you cannot create , already plotted")
      return
    }
    console.log("calculatedPoint", calculatedPoint.lat(), calculatedPoint.lng())
    this.createCell(omgpolygon.distance, calculatedPoint.lat(), calculatedPoint.lng())
  }



  /** This method creates a new polygon to the right of the exisiting one on a right click */
  polygonRightClicked(omgpolygon) {
    console.log("polygon Right clicked!!!", omgpolygon)

    // return google latLng of the centre 
    var newPoint = this.mapService.returnPoint(omgpolygon.centre.lat, omgpolygon.centre.lng);

    //calculate the centre of the new cell as LatLng
    var calculatedPoint = this.mapService.EOffsetBearing(newPoint, (omgpolygon.distance) * 3 ** .5, 90)

    // check if there is already a cell or not, if yes avoid overwriting
    if (this.mapService.isAlreadyPlotted(calculatedPoint, this.OMGpolygons)) {
      console.log("you cannot create , already plotted")
      return
    }
    console.log("calculatedPoint", calculatedPoint.lat(), calculatedPoint.lng())

    // Now create the polygon as we now know the centre of the new hexagon
    this.createCell(omgpolygon.distance, calculatedPoint.lat(), calculatedPoint.lng())
  }
}





// OMGPloygon is customised google polygon
interface OMGPolygon {

  id: string
  color: string
  centre: any //centre of cell {lat:57.000,lng:67.09099 }
  sides: any[] // vertices 
  neighbours: any[]// contains ids of neighboring cells
  distance: number // in meters


}
