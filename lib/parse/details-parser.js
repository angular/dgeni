module.exports = function(text) {
  //!details /path/to/local/docs/file.html
  //!details="REGEX" /path/to/local/docs/file.html
  text = text.replace(/\/\/!details\s*(?:=\s*['"](.+?)['"])?\s+(.+?)\n\s*(.+?\n)/img,
    function(_, pattern, url, line) {
      url = '/notes/' + url;
      pattern = new RegExp(pattern || '.+');
      return line.replace(pattern, function(match) {
        return '<div class="nocode nocode-content" data-foldout data-url="' + url + '">' + match + '</div>';
      });
    }
  );
};