jest.dontMock('../app/scripts/core/frame/page-content.jsx');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

describe('STUP', function() {

  it('should render component', function() {
    //GIVEN component to be displayed
    var PageContent = require('../app/scripts/core/frame/page-content.jsx');

    //WHEN component is rendered
    var page = TestUtils.renderIntoDocument(
      <PageContent/>
    );

    //THEN layout is created
    var title = TestUtils.findRenderedDOMComponentWithTag(page, 'h2');
    expect(title.getDOMNode().textContent).toEqual('\'Allo, \'Allo!');
  });

});
