import { User } from "../../src/models/User";
export class UserInitializer {
  email: string;  
  username: string;
  password: string;
  constructor() {
    this.username = "testuser18";
    this.email = "testuser18@gmail.com";
    this.password = "testuser18password";
  } 

  getLogin() {
    return {
      identifier: this.email,
      password: this.password
    };
  }
}