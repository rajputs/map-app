import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AgmCoreModule } from 'angular2-google-maps/core'
import { AppComponent } from './app.component';
import { MapDisplayComponent } from './map-display/map-display.component';
import {MapserviceService} from './mapservice.service'
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
//import {DialogModule} from 'primeng/primeng'
@NgModule({
  declarations: [
    AppComponent,
    MapDisplayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
   
     AgmCoreModule.forRoot({
      apiKey: 
      libraries: 
    })
    
  ],
  providers: [MapserviceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
