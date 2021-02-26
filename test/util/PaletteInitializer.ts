export class PaletteInitializer {
  name: string;
  colors: Color[];
  user: string;
  group: string;

  constructor(props: {name?: string; colors?: Color[]; user?: string} = {}) {
    this.name = props.name || "Example Palette";
    this.colors = props.colors || [
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
    ];

    this.user = props.user;
  }
}