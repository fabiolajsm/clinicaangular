import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideHttpClient } from '@angular/common/http';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';

const firebaseConfig = {
  apiKey: 'AIzaSyA_bKUiNDce6Tg8Pn0JDtfG7rhr7AWCbrs',
  authDomain: 'clinicaangular-edc0f.firebaseapp.com',
  projectId: 'clinicaangular-edc0f',
  storageBucket: 'clinicaangular-edc0f.appspot.com',
  messagingSenderId: '741665652681',
  appId: '1:741665652681:web:f1c0aaaf8176ff3ddcb218',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideHttpClient(),
    provideAnimations(),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
  ],
};
