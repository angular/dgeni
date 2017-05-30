import {DocCollection} from './DocCollection';

export type ProcessorDef = Processor | (((...args: any[]) => Processor) & { name?: string });

export interface Processor {
  $process(docs: DocCollection): DocCollection | PromiseLike<DocCollection> | void;
  name?: string;
  description?: string;
  $runBefore?: string[];
  $runAfter?: string[];
  $enabled?: boolean;
  $package?: string;
}
