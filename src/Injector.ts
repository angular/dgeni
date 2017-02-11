export interface Injector {
  get(token: string): any;
}