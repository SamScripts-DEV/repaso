import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentialForm!: FormGroup; // Usando el operador de no nulidad

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    // Inicialización de credentialForm
    this.credentialForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.chatService.signup(this.credentialForm.value);
      await loading.dismiss();
      this.router.navigateByUrl('/chat', { replaceUrl: true });
    } catch (err) {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Sign up failed',
        message: (err as { message: string }).message, // Conversión explícita
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async signIn() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.chatService.signin(this.credentialForm.value);
      await loading.dismiss();
      this.router.navigateByUrl('/chat', { replaceUrl: true });
    } catch (err) {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: ':(',
        message: (err as { message: string }).message, // Conversión explícita
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  get email() {
    return this.credentialForm.get('email');
  }

  get password() {
    return this.credentialForm.get('password');
  }
}
