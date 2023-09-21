import React from 'react';
import { Text, RichText } from '@sitecore-jss/sitecore-jss-react';
//import { Placeholder } from '@sitecore-jss/sitecore-jss-react';
//import ComponentFactory from "./ComponentFactory";

/**
 * A simple Content Block component, with a heading and rich text block.
 * This is the most basic building block of a content site, and the most basic
 * JSS component that's useful.
 */
const ContentBlock = (props) => {
  const fields = props.fields;

  return (
    <div className="contentBlock">
      <Text tag="h6" className="contentTitle" field={fields.heading} />
      <RichText className="contentDescription" field={fields.description} />
      {/*
      Example of using a placeholder inside React compoents
      <Placeholder name="react" rendering={props.rendering} componentFactory={ComponentFactory} />
      */}
    </div>
  );
}

export default ContentBlock;
