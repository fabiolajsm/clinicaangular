import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CollectionReference,
  addDoc,
  collection,
  deleteDoc,
  query,
  Firestore,
  collectionData,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Schedules, Specialities } from '../interfaces/specialities.interface';

@Injectable({
  providedIn: 'root',
})
export class SpecialitiesService {
  firestore = inject(Firestore);
  collectionName = 'specialities';
  schedulesCollectionName = 'schedules';

  getSpecialities(): Observable<Specialities[]> {
    const specialitiesRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    const specialitiesQuery = query(specialitiesRef);
    return collectionData(specialitiesQuery, { idField: 'id' }) as Observable<
      Specialities[]
    >;
  }

  addSpeciality(newSpecialityName: string) {
    const specialitiesRef: CollectionReference = collection(
      this.firestore,
      this.collectionName
    );
    addDoc(specialitiesRef, { name: newSpecialityName });
  }

  getSchedules(): Observable<Schedules[]> {
    const schedulesRef: CollectionReference = collection(
      this.firestore,
      this.schedulesCollectionName
    );
    const schedulesQuery = query(schedulesRef);
    return collectionData(schedulesQuery, { idField: 'id' }) as Observable<
      Schedules[]
    >;
  }

  insertOrUpdateSchedule(
    user_id: string,
    start: string,
    end: string,
    docId: string | null
  ) {
    if (docId) {
      const updateRef = doc(
        this.firestore,
        this.schedulesCollectionName,
        docId
      );
      updateDoc(updateRef, {
        user_id: user_id,
        start_time: start,
        end_time: end,
      });
    } else {
      const schedulesRef: CollectionReference = collection(
        this.firestore,
        this.schedulesCollectionName
      );
      addDoc(schedulesRef, {
        user_id: user_id,
        start_time: start,
        end_time: end,
      });
    }
  }

  deleteScheduleByUserId(docId: string): void {
    const scheduleDocRef = doc(
      this.firestore,
      this.schedulesCollectionName,
      docId
    );
    deleteDoc(scheduleDocRef);
  }
}
