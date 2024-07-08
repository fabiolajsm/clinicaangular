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

  downloadPatientHistory(
    name: string,
    lastname: string,
    specialty: string,
    appointmentsPatient: Appointment[]
  ) {
    const document = new jsPDF('portrait', 'px', 'a4');
    const currentDate = new Date();
    const formattedDate =
      currentDate.getDate() +
      '/' +
      (currentDate.getMonth() + 1) +
      '/' +
      currentDate.getFullYear();

    const textOptions: TextOptionsLight = {
      maxWidth: 520,
      align: 'left',
      lineHeightFactor: 1.2,
    };
    const logo = new Image();
    logo.src = '../../assets/favicon.jpg';

    logo.onload = () => {
      document.addImage(logo, 'JPG', 35, 15, 60, 60);
      document.setFontSize(18);
      document.setFont('helvetica', 'bold');
      document.text(
        `Historial clínico de ${name} ${lastname}`,
        110,
        35,
        textOptions
      );

      document.setFontSize(14);
      document.setFont('helvetica', 'normal');
      document.text(`Especialidad: ${specialty}`, 110, 55, textOptions);

      document.setFontSize(12);
      document.text('Fecha de emisión: ' + formattedDate, 110, 75, textOptions);

      let position = 110;
      if (!appointmentsPatient.length) {
        document.setFontSize(14);
        document.text(
          `No hay historial disponible para la especialidad ${specialty}`,
          35,
          position,
          textOptions
        );
      } else {
        appointmentsPatient.forEach((data) => {
          position += 20;
          document.setFontSize(14);
          document.setFont('helvetica', 'bold');
          document.text(`Detalle del turno:`, 35, position, textOptions);

          position += 20;
          document.setFontSize(12);
          document.setFont('helvetica', 'normal');
          document.text(
            `Día: ${data.day}. Horario: ${data.start_time} - ${data.end_time} hs. Fecha: ${data.date}. Especialista: ${data.professional_name}`,
            35,
            position,
            textOptions
          );

          if (data.patientHistory) {
            const { height, weight, temperature, pressure, extraData } =
              data.patientHistory;
            position += 20;
            document.text(
              `Altura: ${height} cm. Peso: ${weight} kg. Temperatura: ${temperature} °C. Presión arterial: ${pressure} mmHg`,
              35,
              position,
              textOptions
            );
            if (extraData) {
              Object.keys(extraData).forEach((key) => {
                position += 20;
                document.text(
                  `${key}: ${extraData[key]}`,
                  35,
                  position,
                  textOptions
                );
              });
            }
          }
          position += 20;
        });
      }
      document.save(`${name}-${lastname}-historial-clinico-${specialty}`);
    };
  }
}
