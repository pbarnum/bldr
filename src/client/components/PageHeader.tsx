import React from 'react';

export interface PageHeaderProps {
  title: string;
  message: string;
}

const PageHeader = (props: PageHeaderProps): React.ReactElement => (
  <div className="jumbotron">
    <h1 className="display-4">{props.title}</h1>
    <p className="lead">{props.message}</p>
    <hr className="my-4" />
  </div>
);

export default PageHeader;
