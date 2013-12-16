var parser = require('../../lib/__legacy__template-helpers/pre-tag');

describe("template-helpers/pre-tag", function() {
  it("should add pretty print css classes", function() {
    var placeholders = jasmine.createSpyObj('placeholders', ['add', 'get']);

    parser('<pre>some code block</pre>\nsome text\n<pre>some other code block</pre>', null, placeholders);
    expect(placeholders.add).toHaveBeenCalled();
    expect(placeholders.add.calls[0].args[1]).toEqual('<pre class="prettyprint linenums">some code block</pre>');
    expect(placeholders.add.calls[1].args[1]).toEqual('<pre class="prettyprint linenums">some other code block</pre>');
  });
});