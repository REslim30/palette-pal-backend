export default class PaletteInitializer {
  name: string;
  user: string;
  palettes: string[]

  constructor({ name, palettes, user }: any = {}) {
    this.name = name || "Example Group";
    this.palettes = palettes;
    this.user = user;
  }
}