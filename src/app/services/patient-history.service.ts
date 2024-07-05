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
import { PatientHistory } from '../interfaces/appointment.interface';
import jsPDF from 'jspdf';

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

  downloadPatientHistory(
    name: string,
    lastname: string,
    patientHistory: PatientHistory[]
  ) {
    const document = new jsPDF('portrait', 'px', 'a4');
    const currentDate = new Date();
    const formattedDate =
      currentDate.getDate() +
      '/' +
      (currentDate.getMonth() + 1) +
      '/' +
      currentDate.getFullYear();

    document.text('Fecha de emisión: ' + formattedDate, 35, 20);
    const logo = new Image();
    logo.src = '../../assets/favicon.jpg';
    document.addImage(logo, 'JPG', 120, 40, 40, 40);
    document.text('Clínica Online', 190, 80);
    document.text(`Historial clínico de ${name} ${lastname}`, 35, 100);
    let position = 120;
    patientHistory.forEach((data) => {
      document.text('Altura: ' + data.height + ' cm', 35, (position += 15));
      document.text('Peso: ' + data.weight + ' Kg', 35, (position += 15));
      document.text(
        'Temperatura: ' + data.temperature + '°C',
        35,
        (position += 15)
      );
      document.text('Presión arterial: ' + data.pressure, 35, (position += 15));

      if (data.extraData) {
        for (const key in data.extraData) {
          if (data.extraData.hasOwnProperty(key)) {
            document.text(
              `${key}: ${data.extraData[key]}`,
              35,
              (position += 15)
            );
          }
        }
      }

      document.text(
        '----------------------------------------------------------------',
        35,
        (position += 15)
      );
    });

    document.save(`${name}-${lastname}-historia-clinica`);
  }
}
