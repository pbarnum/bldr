export interface Route {
  methods: string[];
}

export interface Path {
  [route: string]: Route;
}
