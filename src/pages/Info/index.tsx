import React from 'react';
import moment from 'moment';

import { Avatar } from 'antd';
import {
  CloseCircleOutlined,
  RightSquareOutlined,
  LeftSquareOutlined,
} from '@ant-design/icons';

import styles from './styles.less';

interface IProps {}

interface IState {
  isHide: boolean;
}

const fakeUser = [
  {
    avatar: 'https://res.u-tools.cn/assets/avatars/ai2hj0be5rcw6eud.png',
    name: 'Tuisku',
    ip: '192.168.60.123',
    startTime: moment(),
  },
];

class Index extends React.Component<IProps, IState> {
  senderId: number = 0;
  constructor(props: IProps) {
    super(props);
    this.state = {
      isHide: false,
    };
  }

  componentDidMount() {
    window.ipcRenderer.on(
      'remoteInfo',
      async (
        sender: { senderId: number },
        data: { remoteIp: string; displayInfo: RDP.DisplayInfo[] },
      ) => {
        console.info('remoteInfo', data);
        if (sender.senderId && sender.senderId > 0) {
          this.senderId = sender.senderId;
        }
      },
    );
  }

  actionClickHide = () => {
    console.info('this.senderId', this.senderId);
    window.ipcRenderer.sendTo(this.senderId, 'info_hide', {});
    this.setState({
      isHide: true,
    });
  };

  actionClickShow = () => {
    console.info('this.senderId', this.senderId);
    window.ipcRenderer.sendTo(this.senderId, 'info_show', {});
    this.setState({
      isHide: false,
    });
  };

  actionClickClose = () => {
    console.info('this.senderId', this.senderId);
    window.ipcRenderer.sendTo(this.senderId, 'info_close', {});
  };

  public render() {
    const { isHide } = this.state;

    if (isHide) {
      return (
        <div className={styles.hideBox} onClick={this.actionClickShow}>
          <LeftSquareOutlined />
        </div>
      );
    }

    return (
      <div className={styles.infoBox}>
        <div className={styles.header}>
          <img src="qr_logo.png" className={styles.logo} />
          <div className={styles.text}>
            QuickRDP
            <br />
            <span>for uTools</span>
          </div>
          <div className={styles.hide} onClick={this.actionClickHide}>
            隐藏&nbsp;&nbsp;
            <RightSquareOutlined />
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
        <div className={styles.closeAll} onClick={this.actionClickClose}>
          关闭连接
        </div>
      </div>
    );
  }
}

export default Index;
