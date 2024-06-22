import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  query,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Appoiment } from '../interfaces/appoiment.interface';

@Injectable({
  providedIn: 'root',
})
export class AppoimentService {
  firestore = inject(Firestore);
  collectionName = 'appoiments';

  getAppoiments(): Observable<Appoiment[]> {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    const appQuery = query(appRef);
    return collectionData(appQuery, {
      idField: 'id',
    }) as Observable<Appoiment[]>;
  }
}
