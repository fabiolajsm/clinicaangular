import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Firestore, collectionData } from '@angular/fire/firestore';
import {
  Patients,
  Role,
  Specialists,
  UserInterface,
} from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  firestore = inject(Firestore);
  user$ = user(this.firebaseAuth);

  userCollectionName = 'users';
  historyCollectionName = 'loginHistory';

  register(email: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {});
    return from(promise);
  }

  updateAdmin(adminData: UserInterface) {
    const usersRef = collection(this.firestore, this.userCollectionName);
    addDoc(usersRef, adminData);
  }

  updatePatient(patientData: Patients) {
    const usersRef = collection(this.firestore, this.userCollectionName);
    addDoc(usersRef, patientData);
  }

  updateSpecialist(specialistData: Specialists) {
    const usersRef = collection(this.firestore, this.userCollectionName);
    addDoc(usersRef, specialistData);
  }

  changeProfileEnable(id: string, status: boolean) {
    const userRef = doc(this.firestore, this.userCollectionName, id);
    updateDoc(userRef, {
      profileEnabled: status,
    });
  }

  login(email: string, password: string, role: Role): Observable<void> {
    localStorage.setItem('role', role);
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {});
    return from(promise);
  }

  logout(): Observable<void> {
    localStorage.removeItem('role');
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  getUsers(): Observable<[]> {
    const users = collection(this.firestore, this.userCollectionName);
    return collectionData(users, { idField: 'id' }) as Observable<[]>;
  }

  addToLoginHistory(email: string) {
    const loginHistory = collection(this.firestore, this.historyCollectionName);
    addDoc(loginHistory, { email: email, date: new Date() });
  }

  getUserByEmail(email: string): Observable<UserInterface | undefined> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', email));

    return new Observable<UserInterface | undefined>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = doc.data() as UserInterface;
            const userData = { ...data, id: doc.id };
            observer.next(userData);
          });
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.user$.pipe(map((user) => user !== null));
  }

  getIsRole(role: Role): boolean {
    return role === localStorage.getItem('role');
  }
}
