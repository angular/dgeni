module.exports = function(text) {
  //!annotate CONTENT
  //!annotate="REGEX" CONTENT
  //!annotate="REGEX" TITLE|CONTENT
  return text.replace(/\n?\/\/!annotate\s*(?:=\s*['"](.+?)['"])?\s+(.+?)\n\s*(.+?\n)/img,
    function(_, pattern, content, line) {
      var title, text, split = content.split(/\|/);
      pattern = new RegExp(pattern || '.+');
      if(split.length > 1) {
        text = split[1];
        title = split[0];
      } else {
        title = 'Info';
        text = content;
      }
      return "\n" + line.replace(pattern, function(match) {
        return '<div class="nocode nocode-content" data-popover ' +
                 'data-content="' + text + '" ' +
                 'data-title="' + title + '">' +
                    match +
               '</div>';
      });
    }
  );
};