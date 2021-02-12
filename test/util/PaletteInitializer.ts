import { Color } from "../../src/models/Palette";

export class PaletteInitializer {
  name: string;
  colors: Color[];

  constructor() {
    this.name = 'Example Palette';
    this.colors = [
      {
        name: "Primary Color",
        shades: [
          "#abcdef",
          "#123456",
          "#654321"
        ]
      },
      {
        name: "Secondary Color",
        shades: [
          "#abcdef",
          "#55aaff",
          "#2288cc",
          "#eeccaa"
        ]
      },
    ]
  }
}