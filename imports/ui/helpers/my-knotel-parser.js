
'use strict';

import YAML from 'js-yaml';
import _ from 'underscore';

import getDefaultErrorComponent from '../components/my-knotel/default-error-component';


const MyKnotelParser = {

  parse(reactComponents, yaml, debug) {
    const parsedComponents = MyKnotelParser._parseComponents(...arguments);
    if (_.isArray(parsedComponents)) return parsedComponents;
    return [parsedComponents];
  },


  _parseComponents(reactComponents, yaml, debug) {
    if (!yaml || !yaml.trim())
      return MyKnotelParser._errorComponent(reactComponents, debug, MyKnotelParser._errorMessages.noYaml);
    const [ parsingError, parsedComponents ] = MyKnotelParser._loadYamlSafely(yaml);
    if (parsingError)
      return MyKnotelParser._errorComponent(reactComponents, debug, MyKnotelParser._errorMessages.notParsed);
    if (!parsedComponents || !_.size(parsedComponents))
      return MyKnotelParser._errorComponent(reactComponents, debug, MyKnotelParser._errorMessages.noComponents);

    const parsedReactComponents = _.compact(_.map(parsedComponents, options => {
      const { component, ...props } = options;
      const Component = reactComponents[component];
      if (!Component)
        return MyKnotelParser._errorComponent(reactComponents, debug, MyKnotelParser._errorMessages.wrongComponent, component);
      const propsError = MyKnotelParser._validateComponentProps(Component, props);
      if (propsError)
        return MyKnotelParser._errorComponent(reactComponents, debug, MyKnotelParser._errorMessages.wrongProp, propsError);
      return { Component, props }
    }));

    if (!parsedReactComponents.length)
      return MyKnotelParser._errorComponent(reactComponents, debug, MyKnotelParser._errorMessages.noValidComponents);
    return parsedReactComponents;
  },


  _loadYamlSafely(yaml) {
    let parsedYAML = null;
    let error = null;
    try { parsedYAML = YAML.safeLoad(yaml) }    catch (e) { error = e.message }
    return [ error, parsedYAML ];
  },


  _validateComponentProps(component, props) {
    let error = null;
    try { if (component.validateProps) component.validateProps(props) }    catch (e) { error = e.message }
    return error;
  },


  _errorMessages: {
    noYaml: {
      debug: 'We don\'t seem to have any yaml in the editor, do we?',
      user: 'No information for this property. Try picking another one in the picker above.',
    },
    notParsed: {
      debug: 'Can\'t understand yaml code structure. Please use Default page as an example.',
      user: 'No information for this property. Try picking another one in the picker above.',
    },
    noComponents: {
      debug: 'Can\'t find any components in yaml. Please use Default page as an example.',
      user: 'No information for this property. Try picking another one in the picker above.',
    },
    wrongComponent: {
      debug: 'Wrong component name: ',
      user: null,
    },
    wrongProp: {
      debug: 'Wrong or missing component property: ',
      user: null,
    },
    noValidComponents: {
      debug: 'Can\'t find any valid components in yaml. Please use Default page as an example.',
      user: 'No information for this property. Try picking another one in the picker above.',
    },
  },


  _errorComponent(reactComponents, debug, errorMessageObject, suffix) {
    const errorMessageConst = errorMessageObject[debug ? 'debug' : 'user'];
    if (!errorMessageConst) return null;
    const errorMessage = errorMessageConst + (suffix || '');
    const Component = reactComponents.error || getDefaultErrorComponent({ errorMessage });
    return { Component, props: { errorMessage }};
  },
};

export default MyKnotelParser;

