import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AiAssistantComponent } from './ai-assistant.component';

const routes: Routes = [{ path: '', component: AiAssistantComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AiAssistantRoutingModule { }
