import React from 'react';
import MainMenu from './main-menu';
import PageContent from './page-content';

export default class PageFrame extends React.Component {

  render() {
    return (
      <div id="page" className="blue">
        <input type="checkbox" id="trigger" className="trigger"/>
        <label htmlFor="trigger">
          <i className="fa fa-bars"></i>
        </label>
        <MainMenu/>
        <PageContent>
          {this.props.children}
        </PageContent>
      </div>
    );
  }

}
