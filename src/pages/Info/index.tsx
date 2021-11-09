import React from 'react';

import styles from './styles.less';

interface IProps {}

interface IState {}

class Index extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  public render() {
    return <div className={styles.infoBox}>hello world!</div>;
  }
}

export default Index;
