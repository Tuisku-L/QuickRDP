import React from 'react';
import moment from 'moment';

import { Avatar } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';

import styles from './styles.less';

interface IProps {}

interface IState {}

const fakeUser = [
  {
    avatar: 'https://res.u-tools.cn/assets/avatars/ai2hj0be5rcw6eud.png',
    name: 'Tuisku',
    ip: '192.168.60.123',
    startTime: moment(),
  },
];

class Index extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  actionClickHide = () => {};

  public render() {
    return (
      <div className={styles.infoBox}>
        <div className={styles.header}>
          <img src="qr_logo.png" className={styles.logo} />
          <div className={styles.text}>
            QuickRDP
            <br />
            <span>for uTools</span>
          </div>
        </div>
        <div className={styles.infoBox}>
          <div className={styles.title}>当前连接</div>
          <div className={styles.currentList}>
            {fakeUser.map((info) => (
              <div className={styles.line}>
                <div className={styles.avatar}>
                  <Avatar src={info.avatar} />
                </div>
                <div className={styles.ip}>
                  <div>{info.name}</div>
                  <div>{info.ip}</div>
                </div>
                <div className={styles.time}>20s</div>
                {/* <div>
                  <CloseCircleOutlined />
                </div> */}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.closeAll}>关闭连接</div>
      </div>
    );
  }
}

export default Index;
