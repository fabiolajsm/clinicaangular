import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF, { TextOptionsLight } from 'jspdf';
import { Appointment } from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root',
})
export class GeneratePdfService {
  public async createPDF(data: HTMLElement, filename: string): Promise<void> {
    const DATA: any = data;
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      scale: 3,
    };

    return html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');
        // Add image Canvas to PDF
        const bufferX = 15;
        const bufferY = 15;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult) => {
        docResult.save(`${filename}.pdf`);
      });
  }

  downloadPatientHistory(
    name: string,
    lastname: string,
    specialty: string,
    appointmentsPatient: Appointment[]
  ) {
    const newDoc = new jsPDF('portrait', 'px', 'a4');
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
    const logo = document.createElement('img') as HTMLImageElement;
    logo.src = 'https://i.ibb.co/j8ZLFZj/favicon.jpg';

    logo.onload = () => {
      newDoc.addImage(logo, 'PNG', 35, 15, 60, 60);
      newDoc.setFontSize(18);
      newDoc.setFont('helvetica', 'bold');
      newDoc.text(
        `Historial clínico de ${name} ${lastname}`,
        110,
        35,
        textOptions
      );

      newDoc.setFontSize(14);
      newDoc.setFont('helvetica', 'normal');
      newDoc.text(`Especialidad: ${specialty}`, 110, 55, textOptions);

      newDoc.setFontSize(12);
      newDoc.text('Fecha de emisión: ' + formattedDate, 110, 75, textOptions);

      let position = 110;
      if (!appointmentsPatient.length) {
        newDoc.setFontSize(14);
        newDoc.text(
          `No hay historial disponible para la especialidad ${specialty}`,
          35,
          position,
          textOptions
        );
      } else {
        appointmentsPatient.forEach((data) => {
          position += 20;
          newDoc.setFontSize(14);
          newDoc.setFont('helvetica', 'bold');
          newDoc.text(`Detalle del turno:`, 35, position, textOptions);

          position += 20;
          newDoc.setFontSize(12);
          newDoc.setFont('helvetica', 'normal');
          newDoc.text(
            `Día: ${data.day}. Horario: ${data.start_time} - ${data.end_time} hs. Fecha: ${data.date}. Especialista: ${data.professional_name}`,
            35,
            position,
            textOptions
          );

          if (data.patientHistory) {
            const { height, weight, temperature, pressure, extraData } =
              data.patientHistory;
            position += 20;
            newDoc.text(
              `Altura: ${height} cm. Peso: ${weight} kg. Temperatura: ${temperature} °C. Presión arterial: ${pressure} mmHg`,
              35,
              position,
              textOptions
            );
            if (extraData) {
              Object.keys(extraData).forEach((key) => {
                position += 20;
                newDoc.text(
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
      newDoc.save(`${name}-${lastname}-historial-clinico-${specialty}`);
    };
  }
}
