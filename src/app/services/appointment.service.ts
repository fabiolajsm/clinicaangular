import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  QueryConstraint,
  addDoc,
  collection,
  collectionData,
  doc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  firestore = inject(Firestore);
  collectionName = 'appointments';

  createAppointment(newApp: Appointment) {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    addDoc(appRef, newApp);
  }

  getAppointments(): Observable<Appointment[]> {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    const appQuery = query(appRef);
    return collectionData(appQuery, {
      idField: 'id',
    }) as Observable<Appointment[]>;
  }

  getAppointmentsBySpecialist(id: string): Observable<Appointment[]> {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    const specialtyConstraint: QueryConstraint = where(
      'professional_id',
      '==',
      id
    );
    const appQuery = query(appRef, specialtyConstraint);
    return collectionData(appQuery, { idField: 'id' }) as Observable<
      Appointment[]
    >;
  }

  updateAppointmentStatus(appId: string, status: string) {
    const appRef = doc(this.firestore, this.collectionName, appId);
    updateDoc(appRef, {
      status: status,
    });
  }
  updateComment(appId: string, newReview: string) {
    const appRef = doc(this.firestore, this.collectionName, appId);
    updateDoc(appRef, {
      review: newReview,
    });
  }
  updateDiagnosis(appId: string, newDiagnosis: string) {
    const appRef = doc(this.firestore, this.collectionName, appId);
    updateDoc(appRef, {
      diagnosis: newDiagnosis,
    });
  }
}
