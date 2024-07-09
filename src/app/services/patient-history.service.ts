import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CollectionReference,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import {
  Appointment,
  PatientHistory,
} from '../interfaces/appointment.interface';
import jsPDF, { TextOptionsLight } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PatientHistoryService {
  firestore = inject(Firestore);
  collectionName = 'patient_history';

  createPatientHistory(data: PatientHistory) {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    addDoc(appRef, data);
  }

  getPatientHistoryByAppointment(
    id_patient: string,
    id_appointment: string
  ): Observable<PatientHistory | undefined> {
    const patientRef = collection(this.firestore, this.collectionName);
    const q = query(
      patientRef,
      where('id_patient', '==', id_patient),
      where('id_appointment', '==', id_appointment)
    );

    return new Observable<PatientHistory | undefined>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          let patientHistory: PatientHistory | undefined;

          querySnapshot.forEach((doc) => {
            const data = doc.data() as PatientHistory;
            const userData = { ...data, id: doc.id };
            patientHistory = userData; // Assuming there's only one document matching the query
          });

          observer.next(patientHistory);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  getPatientHistory(id: string): Observable<PatientHistory[] | undefined> {
    const patientRef = collection(this.firestore, this.collectionName);
    const q = query(patientRef, where('id_patient', '==', id));

    return new Observable<PatientHistory[] | undefined>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          const patientHistoryList: PatientHistory[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data() as PatientHistory;
            const userData = { ...data, id: doc.id };
            patientHistoryList.push(userData);
          });

          observer.next(patientHistoryList);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
