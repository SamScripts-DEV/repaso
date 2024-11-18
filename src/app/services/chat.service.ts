import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app'
import { switchMap, map } from 'rxjs';
import { Observable } from 'rxjs';


export interface User{
  uid: string;
  email: string | null;
};

export interface Message{
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: string;
};


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  currentUser: User | null = null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.onAuthStateChanged((user) => {
      this.currentUser = user
    });

  };

  async signup({email, password}: {email: string, password: string}): Promise<any>{
    const credential = await this.afAuth.createUserWithEmailAndPassword(email,password);
    const uid = credential.user?.uid
    return this.afs.doc(
      `user/${uid}`,
    ).set({
      uid,
      email: credential.user?.email
    })
  }


  signin({email, password}: {email: string, password: string}){
    return this.afAuth.signInWithEmailAndPassword(email, password)
  }

  signOut(): Promise<void>{
    return this.afAuth.signOut()

  }


  addChatMessage(msg: string){
    return this.afs.collection('messages').add({
      msg: msg,
      from: this.currentUser?.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })

  }

  getChatMessages(): Observable<Message[]> {
    let users: User[] = [];
    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        return this.afs.collection<Message>('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' });
      }),
      map(messages => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = (this.currentUser?.uid === m.from).toString();
        }
        return messages;
      })
    );
  }

  private getUsers(){
    return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }

  private getUserForMsg(msgFromId: string, users: User[]): string {
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email || 'No Email';
      }
    }
    return 'Deleted';
  }
}


