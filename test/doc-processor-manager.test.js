import { DocProcessorManager } from '../src/doc-processor-manager';
import { testProcessor } from './mocks/test-processor';

describe("DocProcessorManager", () => {
  it("should load the testProcessor", () => {
    var docProcessor = new DocProcessorManager([testProcessor]);
    expect(docProcessor.processors.get('testProcessor')).toEqual(testProcessor);
  });

  it("should sort the processors by runBefore and runAfter dependencies", () => {
    var docProcessor = new DocProcessorManager([testProcessor]);
    var processors = docProcessor._sortProcessors();
    expect(processors).toEqual([testProcessor]);
  });

  it("should invoke the processor", () => {
    var docProcessor = new DocProcessorManager([testProcessor]);
    docProcessor.run();
  });
});