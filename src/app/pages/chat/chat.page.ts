import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable } from 'rxjs';
import {Geolocation} from '@capacitor/geolocation';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  messages!: Observable<any[]>;
  newMsg = '';
  constructor(private chatService: ChatService, private router: Router) { }
  ngOnInit() {
    this.messages = this.chatService.getChatMessages();
  }
  sendMessage() {
    this.chatService.addChatMessage(this.newMsg).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }

  async sendLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const locationMessage = `📍 Mi ubicación: https://www.google.com/maps?q=${latitude},${longitude}`;

      await this.chatService.addChatMessage(locationMessage);
      this.content.scrollToBottom();
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      alert('No se pudo obtener tu ubicación. Por favor, verifica los permisos.');
    }
  }

  signOut() {
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }
}
