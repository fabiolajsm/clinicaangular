import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  query,
} from '@angular/fire/firestore';
import { HealthInsurance } from '../interfaces/healthInsurance.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HealthInsuranceService {
  firestore = inject(Firestore);
  collectionName = 'healthInsurances';

  getHealthInsurances(): Observable<HealthInsurance[]> {
    const healthInsuranceRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    const healthInsuranceQuery = query(healthInsuranceRef);
    return collectionData(healthInsuranceQuery, {
      idField: 'id',
    }) as Observable<HealthInsurance[]>;
  }
}
