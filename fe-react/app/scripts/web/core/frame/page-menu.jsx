import React from 'react';

export default class PageMenu extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    return(
      <div id="title">
        <div className="content">
          <h2>{this.props.values.title}</h2>
          <nav>
            <ul>
              {this.props.values.items.map(item => {
                return <li className={item.selected ? 'tab-link current' : 'tab-link'} key={item.id} data-tab={item.id}>
                  <a href={item.uri}>
                    <i className={item.class}></i>
                    <span>{item.name}</span>
                  </a>
                </li>;
              })}
            </ul>
          </nav>
        </div>
      </div>
    );
  }

}
