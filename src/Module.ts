export interface FactoryDef {
  (...args: any[]): any;
  name?: string;
};

export type TypeDef = FactoryDef;

export type InjectionType = 'factory' | 'type' | 'value';

export interface Module {
  [token: string]: [InjectionType, any];
}