import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BuilderV2Module} from "../builder-v2/builder-v2.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BuilderV2Module
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
