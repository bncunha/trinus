import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app/app.component';
import { appRoutes } from './app/app.routes';
import { authSessionInterceptor } from './app/interceptors/auth-session.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([authSessionInterceptor])), provideRouter(appRoutes)]
}).catch((error) => console.error(error));
