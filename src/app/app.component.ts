import { Component, OnInit } from '@angular/core';
import { Event, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {detect} from 'detect-browser';
import { SocialUser, AuthService, FacebookLoginProvider } from 'angularx-social-login';
const browser = detect();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private userIp: string;
  public fBuser: any = SocialUser;
  constructor(
    private http: HttpClient,
    private router: Router,
    private socialAuthService: AuthService) {
  }

  ngOnInit() {
    this.http.get<{
      city: any;
      country: any;
      ip: any;
    }>('https://api.ipify.org/?format=json').subscribe((data) => {
      this.userIp = data.ip;
    }, console.log);
  }

  // using angular sociallogin
  facebookLogin() {
    if (this.userIp) {
      this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID)
      .then((userData) => {
        this.fBuser = userData;
        this.postfbuser();
      })
      .catch(console.log);
    }
  }

  postfbuser() {
    if (this.userIp) {
      const newUser = {
        name: this.fBuser.name,
        email: this.fBuser.email,
        provider: this.fBuser.provider,
        clientIp: this.userIp,
        browserName: browser.name,
        geolocation: this.getLocation()
      };
      this.http.post('http://localhost:3000/auth/facebook', newUser)
      .subscribe((res) => {
        console.log(res);
      }, console.log);
    }
  }

  // using passport.js
 async googlelogin() {
  const location = await this.getLocation();
  console.log('location - ', location);
  if (this.userIp) {
    this.http.get<{success: boolean}>('http://localhost:3000/auth', { headers : {
      browserName: browser.name,
      clientIp: this.userIp,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    }})
    .subscribe((res) => {
      console.log('server response ', res.success);
      if (res.success) {
      window.location.href = 'http://localhost:3000/auth/google';
      }
    }, console.log);
  }
 }

 getLocation(): Promise<{longitude: number, latitude: number}> {
  const location = {longitude: null, latitude: null};
  const p: Promise<{longitude: number, latitude: number}> = new Promise((res, rej) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          location.longitude = position.coords.longitude;
          location.latitude = position.coords.latitude;
          res(location);
        });
      } else {
        rej('navigator geolocation not exist');
      }
    });

  return p;


}
}
