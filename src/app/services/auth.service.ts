import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import {
  addDoc,
  collection,
  doc,
  getDoc,
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
  getCurrentUserEmail() {
    return getAuth().currentUser?.email;
  }

  async createUser(
    newUserData: UserInterface | Patients | Specialists
  ): Promise<boolean> {
    const usersRef = collection(this.firestore, this.userCollectionName);

    try {
      await addDoc(usersRef, newUserData);
      return true;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return false;
    }
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
    const formattedDate = this.formatDate(new Date());
    addDoc(loginHistory, { email: email, date: formattedDate });
  }

  private formatDate(date: Date): string {
    const formatted = `${date.getFullYear()}-${this.padNumber(
      date.getMonth() + 1
    )}-${this.padNumber(date.getDate())} a las ${this.padNumber(
      date.getHours()
    )}:${this.padNumber(date.getMinutes())} hs`;
    return formatted;
    return formatted;
  }
  private padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  getUserByEmail(email: string): Observable<UserInterface | undefined> {
    const usersRef = collection(this.firestore, this.userCollectionName);
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

  getRole(): string {
    return localStorage.getItem('role') ?? '';
  }

  getIsRole(role: Role): boolean {
    return role === localStorage.getItem('role');
  }

  getLoginHistory(): Observable<[]> {
    const loginHistory = collection(this.firestore, this.historyCollectionName);
    return collectionData(loginHistory, { idField: 'id' }) as Observable<[]>;
  }

  getDoctors(): Observable<UserInterface[]> {
    const usersRef = collection(this.firestore, this.userCollectionName);
    const doctorConstraint = where('role', '==', 'ESPECIALISTA');
    const doctorsQuery = query(usersRef, doctorConstraint);
    return collectionData(doctorsQuery, { idField: 'id' }) as Observable<
      UserInterface[]
    >;
  }
}
