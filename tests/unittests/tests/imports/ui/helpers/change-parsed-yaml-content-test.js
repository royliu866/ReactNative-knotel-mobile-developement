import assert from 'assert';
import ChangeParsedYamlContent from '../../../../../../imports/ui/helpers/change-parsed-yaml-content';


describe('ChangeParsedYamlHeaders', () => {
  it('should return content with changed headers', () => {
    const result = ChangeParsedYamlContent.getContentWithChangedHeader(parsedContent);
    assert.strictEqual(result, parsedContentWithChangedHeaders);
  });
  it('should return the same content if there is no headers', () => {
    const result = ChangeParsedYamlContent.getContentWithChangedHeader(parsedContentWithoutHeaders);
    assert.strictEqual(result, parsedContentWithoutHeaders);
  });
});


const parsedContent = `#### Sample markdown(HEADER1)\nSome description Lorem ipsum dolor sit amet, consecte
tur adipisicing elit\n### Sample markdown(HEADER2)\nSome description Lorem ipsum dolor sit amet, consecte
tur adipisicing elit\n\n**Some list example:**\n\n- Lorem ipsum dolor
 sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut\n- Excepteur sint occaecat...`;

const parsedContentWithChangedHeaders = `####Sample markdown(HEADER1)####\n\nSome description Lorem ipsum dolor sit amet, consecte
tur adipisicing elit\n###Sample markdown(HEADER2)###\n\nSome description Lorem ipsum dolor sit amet, consecte
tur adipisicing elit\n\n**Some list example:**\n\n- Lorem ipsum dolor
 sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut\n- Excepteur sint occaecat...`;

const parsedContentWithoutHeaders = `Some description Lorem ipsum dolor sit amet, consecte
tur adipisicing elit\n\n**Some list example:**\n\n- Lorem ipsum dolor
 sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut\n- Excepteur sint occaecat...`;
