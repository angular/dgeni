import {DocCollection} from './DocCollection';

export type ProcessorDef = Processor | ((() => Processor) & { name?: string });

export interface Processor {
  $process(docs: DocCollection): DocCollection | void;
  name?: string;
  description?: string;
  $package?: string;
}
