
'use strict';


const ChangeParsedYamlContent = {
  getContentWithChangedHeader(content) {
    while (content.search(/#+ .*?\n/gm) >= 0) {
      const headerStartPosition = content.search(/#+ .*?\n/gm);
      const spacePosition = content.indexOf(' ', headerStartPosition);
      const newLinePosition = content.indexOf('\n', headerStartPosition);
      let replacedValue = content.substr(spacePosition + 1, newLinePosition - spacePosition - 1);
      let headerLevel = '';
      for (let i = spacePosition - headerStartPosition; i > 0; i--) {
        headerLevel += '#';
      }
      let replacedContent = headerLevel + replacedValue + headerLevel + '\n\n';
      content = content.replace(/#+ .*?\n/, replacedContent)
    }
    return content;
  }
};


export default ChangeParsedYamlContent;
