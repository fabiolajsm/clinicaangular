import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  query,
  updateDoc,
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
  updateAppoimentStatus(appId: string, status: string) {
    const appRef = doc(this.firestore, this.collectionName, appId);
    updateDoc(appRef, {
      status: status,
    });
  }
  updateCommentStatus(appId: string, newReview: string) {
    const appRef = doc(this.firestore, this.collectionName, appId);
    updateDoc(appRef, {
      review: newReview,
    });
  }
  updateDiagnosisStatus(appId: string, newDiagnosis: string) {
    const appRef = doc(this.firestore, this.collectionName, appId);
    updateDoc(appRef, {
      diagnosis: newDiagnosis,
    });
  }
}
