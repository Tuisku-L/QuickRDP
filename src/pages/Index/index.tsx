import React from 'react';
import { history } from 'umi';
import { copy } from 'iclipboard';

import { Button, Input, AutoComplete, Modal, message } from 'antd';
import {
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  HeartFilled,
} from '@ant-design/icons';

import styles from './styles.less';

interface IState {
  ipAddress: string[];
  showPwd: boolean;
  currentPwd: RDP.Password | null;
}

export default class Index extends React.Component<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      ipAddress: [],
      showPwd: true,
      currentPwd: null,
    };
  }

  componentDidMount() {
    const eths = window.os.networkInterfaces();
    let ipAddress: any[] = [];
    for (let name in eths) {
      const interfaces: any = eths[name];
      ipAddress = [
        ...ipAddress,
        ...interfaces.filter(
          (x: any) =>
            x.family === 'IPv4' && x.address !== '127.0.0.1' && !x.internal,
        ),
      ];
    }
    ipAddress = ipAddress.map((x) => x.address);
    this.setState({
      ipAddress,
    });
    let password = window.utools.db.get<RDP.Password>(
      `${window.deviceId}/currentPwd`,
    );
    console.info('password', password);
    this.setState({
      currentPwd: password,
    });
  }

  actionGeneratePwd = () => {
    return Math.floor(
      Math.random() * (999999 - 100000 + 1) + 100000,
    ).toString();
  };

  actionReflushPwd = () => {
    let password = window.utools.db.get<RDP.Password>(
      `${window.deviceId}/currentPwd`,
    );
    password.password = this.actionGeneratePwd();
    window.utools.db.put(password);
    this.setState(
      {
        currentPwd: password,
      },
      () => message.success('更新成功'),
    );
  };

  actionInitPreConnection = async (wsServer: string) => {
    history.push('/remote');

    // Modal.confirm({
    //   title: '',
    //   content: <div>请输入连接密码</div>,
    //   onOk: async () => {
    //     window.remoteWs = window.socketClient.connect(`ws://${wsServer}:9550`);
    //   },
    // });
  };

  actionCopyIpAddress = (ip: string) => {
    if (copy(ip)) {
      message.success('复制成功');
    }
  };

  public render() {
    const { ipAddress, showPwd, currentPwd } = this.state;

    return (
      <div className={styles.contentBox}>
        <div>
          <div className={styles.deviceInfo}>
            <h1 className={styles.topTitle}>连接远程设备</h1>
            <div className={styles.infoBlock}>
              <div style={{ width: '100%' }}>
                <AutoComplete
                  options={[{ value: '192.168.2.221', label: '192.168.2.221' }]}
                  style={{ width: '100%' }}
                >
                  <Input.Search
                    enterButton="连接"
                    size="large"
                    allowClear
                    placeholder="远程设备地址"
                    style={{ width: '100%' }}
                    onSearch={() =>
                      this.actionInitPreConnection('192.168.2.221')
                    }
                  />
                </AutoComplete>
              </div>
            </div>
          </div>
          <div className={styles.deviceInfo} style={{ marginTop: '3em' }}>
            <h1 className={styles.topTitle}>当前设备信息</h1>
            <div className={styles.infoBlock}>
              <div className={styles.title}>设备地址</div>
              <div className={styles.ipAddress}>
                {ipAddress.map((ip) => (
                  <div className={styles.ip} key={ip}>
                    {ip}
                    <span
                      className={styles.copy}
                      onClick={() => this.actionCopyIpAddress(ip)}
                    >
                      <CopyOutlined />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.infoBlock}>
              <div className={styles.title}>动态密码</div>
              <div className={styles.password}>
                {showPwd ? (
                  <span className={styles.pwdBox}>{currentPwd?.password}</span>
                ) : (
                  '******'
                )}
                <span onClick={() => this.setState({ showPwd: !showPwd })}>
                  {showPwd ? (
                    <EyeOutlined className={styles.showPwd} />
                  ) : (
                    <EyeInvisibleOutlined className={styles.showPwd} />
                  )}
                </span>
              </div>
              <div className={styles.btnEdit}>
                <Button
                  size="small"
                  type="primary"
                  onClick={() =>
                    Modal.confirm({
                      title: '提示',
                      content: '是否确认更新本机动态密码',
                      onOk: this.actionReflushPwd,
                      okText: '确认',
                      cancelText: '取消',
                    })
                  }
                >
                  更新密码
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div>
            Made with <HeartFilled style={{ color: 'red' }} /> by{' '}
            <a
              onClick={() =>
                window.utools.shellOpenExternal('https://v2c.tech/')
              }
            >
              Wood
            </a>
            .
          </div>
          <div style={{ color: 'transparent' }}>
            To{' '}
            <span
              style={{ cursor: 'pointer' }}
              onClick={() =>
                window.utools.shellOpenExternal(
                  'https://lovetime-1251792221.cos-website.ap-guangzhou.myqcloud.com/#/',
                )
              }
            >
              NaOH
            </span>
            : I will always miss you like a darling.
          </div>
        </div>
      </div>
    );
  }
}
