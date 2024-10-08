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
import { Observable } from 'rxjs';
import {
  Appointment,
  Appointment_Extra_Info,
  Status,
} from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  firestore = inject(Firestore);
  collectionName = 'appointments';

  async createAppointment(newApp: Appointment) {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    try {
      await addDoc(appRef, newApp);
      return true;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return false;
    }
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

  getAppointmentsBySpecialist(
    id: string,
    status?: Status
  ): Observable<Appointment[]> {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    let constraints: QueryConstraint[] = [where('professional_id', '==', id)];
    if (status) {
      constraints.push(where('status', '==', status));
    }
    const appQuery = query(appRef, ...constraints);

    return collectionData(appQuery, { idField: 'id' }) as Observable<
      Appointment[]
    >;
  }

  getAppointmentsBySpecialistAndPatient(
    specialistId: string,
    patientId: string
  ): Observable<Appointment[]> {
    const appRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    const queryConstraints: QueryConstraint[] = [
      where('professional_id', '==', specialistId),
      where('patient_id', '==', patientId),
      where('status', '==', 'REALIZADO'),
    ];
    const appQuery = query(appRef, ...queryConstraints);
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
  ): Observable<Appointment_Extra_Info[]> {
    const usersRef = collection(this.firestore, 'appointments_extra_info');
    const q = query(usersRef, where('id', '==', appointmentId));

    return new Observable<Appointment_Extra_Info[]>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          const appointments: Appointment_Extra_Info[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Appointment_Extra_Info;
            const appointmentData = { ...data, id: doc.id };
            appointments.push(appointmentData);
          });
          observer.next(appointments);
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
}
