import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  QueryConstraint,
  addDoc,
  collection,
  collectionData,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import {
  Appointment,
  Appointment_Extra_Info,
  PatientHistory,
} from '../interfaces/appointment.interface';

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

  getExtraInfoByAppointmentId(
    appointmentId: string
  ): Observable<Appointment_Extra_Info | undefined> {
    const usersRef = collection(this.firestore, 'appointments_extra_info');
    const q = query(usersRef, where('id', '==', appointmentId));

    return new Observable<Appointment_Extra_Info | undefined>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Appointment_Extra_Info;
            const appointmentData = { ...data, id: doc.id };
            observer.next(appointmentData);
          });
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
  createExtraInfo(data: any) {
    const appRef: CollectionReference = collection(
      this.firestore,
      'appointments_extra_info'
    );
    addDoc(appRef, data);
  }
  createPatientHistory(data: PatientHistory) {
    const appRef: CollectionReference = collection(
      this.firestore,
      'patient_history'
    );
    addDoc(appRef, data);
  }
}
