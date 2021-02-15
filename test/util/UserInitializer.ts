import { User } from "../../src/models/User";
export class UserInitializer {
  email: string;  
  username: string;
  password: string;
  constructor(props: any = {}) {
    this.username = props.username || "testuser18";
    this.email = props.email || "testuser18@gmail.com";
    this.password = props.password || "testuser18password";
  } 

  getLogin() {
    return {
      identifier: this.email,
      password: this.password
    };
  }
}