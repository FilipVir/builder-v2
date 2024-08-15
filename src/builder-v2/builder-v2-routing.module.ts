import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BuilderV2Component} from "./builder-v2.component";

const routes: Routes = [
  {
    path: '',
    component: BuilderV2Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuilderV2RoutingModule {
}
