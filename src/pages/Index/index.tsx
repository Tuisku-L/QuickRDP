import React from 'react';
import { history } from 'umi';
import { copy } from 'iclipboard';

import { Button, Input, AutoComplete, Modal, message, Spin } from 'antd';
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
  remoteIpAddress: string;
  historyList: Array<string>;
  isTryConnect: boolean;
}

export default class Index extends React.Component<any, IState> {
  pwdInput: Input | null = null;
  constructor(props: any) {
    super(props);
    this.state = {
      ipAddress: [],
      showPwd: true,
      currentPwd: null,
      remoteIpAddress: '',
      historyList: [],
      isTryConnect: false,
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

    const historyList = window.utools.db.get<RDP.HistoryList>(
      `${window.deviceId}/historyList`,
    );
    if (historyList) {
      this.setState({
        historyList: historyList.list,
      });
    } else {
      const initList: RDP.HistoryList = {
        _id: `${window.deviceId}/historyList`,
        list: [],
      };
      window.utools.db.put(initList);
    }
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
      () => message.success('????????????'),
    );
  };

  actionInitPreConnection = async (wsServer: string) => {
    if (!wsServer || wsServer.trim() === '') {
      message.warning('???????????????????????????');
      return;
    }

    if (wsServer === 'devtools') {
      window.initDev();
      return;
    }

    const historyList = window.utools.db.get<RDP.HistoryList>(
      `${window.deviceId}/historyList`,
    );

    if (historyList) {
      historyList.list.unshift(wsServer);
      historyList.list = Array.from(new Set(historyList.list));
      historyList.list.splice(5);
      this.setState({
        historyList: historyList.list,
      });
      window.utools.db.put(historyList);
    }

    this.setState({
      isTryConnect: true,
    });

    let remoteWs: typeof window.socketLocal | null =
      window.socketClient.connect(`ws://${wsServer}:9550`);

    const timeout = setTimeout(() => {
      Modal.warning({
        title: '??????',
        content: '??????????????????????????????????????????????????????????????????',
        okText: '??????',
      });
      remoteWs?.disconnect();
      remoteWs = null;
      message.destroy();
      this.setState({
        isTryConnect: false,
      });
    }, 1000 * 5);

    message.warning('?????????...', 5000);

    const user = window.utools.getUser();

    remoteWs!.emit('rdp_pre_connection', {
      deviceId: window.deviceId,
      data: {
        userHash: user?.avatar,
      },
    });

    remoteWs!.on('rdp_remote_info', (data) => {
      if (data.deviceId !== window.deviceId) {
        clearTimeout(timeout);
        message.destroy();
        this.setState({
          isTryConnect: false,
        });
        if (data.data.verifyType === 'none') {
          remoteWs!.disconnect();
          remoteWs = null;
          this.actionOpenRemoteWindow(wsServer, data.data.displayInfo);
        } else {
          Modal.confirm({
            title: '',
            content: (
              <div>
                <div>?????????????????????</div>
                <div>
                  <Input ref={(ref) => (this.pwdInput = ref)} />
                </div>
              </div>
            ),
            onOk: () => {
              if (this.pwdInput) {
                const password = this.pwdInput.state.value;
                remoteWs!.emit('rdp_login_try', {
                  deviceId: window.deviceId,
                  data: {
                    password,
                  },
                });
              }
            },
            onCancel: () => {
              remoteWs!.disconnect();
              remoteWs = null;
            },
            okText: '??????',
            cancelText: '??????',
          });
        }
      }
    });

    remoteWs!.on('rdp_login_success', (data) => {
      console.info('data', data);
      if (data.deviceId !== window.deviceId) {
        const displayInfo = data.data;
        remoteWs!.disconnect();
        remoteWs = null;
        this.actionOpenRemoteWindow(wsServer, displayInfo);
      }
    });

    remoteWs!.on('rdp_login_faild', (data) => {
      if (data.deviceId !== window.deviceId) {
        Modal.warning({
          title: '????????????',
          content: data.data,
        });
        remoteWs!.disconnect();
        remoteWs = null;
      }
    });
  };

  actionOpenRemoteWindow = (
    remoteIp: string,
    displayInfo: Array<RDP.DisplayInfo>,
  ) => {
    console.info('login success', displayInfo);
    const remoteWindow = window.utools.createBrowserWindow(
      'remote.html',
      {
        show: false,
        title: `QuickRDP - ${remoteIp}`,
        webPreferences: {
          preload: './lib/remote_preload.js',
        },
      },
      () => {
        if (window.utools.isDev()) {
          remoteWindow.webContents.openDevTools();
        }
        remoteWindow.maximize();
        remoteWindow.show();
        console.info(
          'remoteWindow.webContents.id',
          remoteWindow.webContents.id,
        );

        window.ipcRenderer.sendTo(remoteWindow.webContents.id, 'initRemote', {
          remoteIp,
          displayInfo,
        });

        window.ipcRenderer.on(
          'resize_remote_height',
          (
            _: any,
            data: {
              width: number;
              height: number;
              currentHeight: number;
              currentWidth: number;
            },
          ) => {
            if (remoteWindow) {
              console.info('data', data);
              // ????????? 5px
              if (
                Math.abs(data.width - data.currentWidth) <= 5 &&
                Math.abs(data.height - data.currentHeight) <= 5
              ) {
                console.info('is 5px');
                return;
              }

              remoteWindow.setSize(data.width, data.height);
            }
          },
        );
      },
    );
  };

  actionCopyIpAddress = (ip: string) => {
    if (copy(ip)) {
      message.success('????????????');
    }
  };

  public render() {
    const {
      ipAddress,
      showPwd,
      currentPwd,
      remoteIpAddress,
      historyList,
      isTryConnect,
    } = this.state;

    return (
      <div className={styles.contentBox}>
        <div>
          <div className={styles.deviceInfo}>
            <h1 className={styles.topTitle}>??????????????????</h1>
            <div className={styles.infoBlock}>
              <div style={{ width: '100%' }}>
                <Spin spinning={isTryConnect}>
                  <AutoComplete
                    options={historyList.map((x) => {
                      return { value: x, label: x };
                    })}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Input.Search
                      enterButton="??????"
                      size="large"
                      placeholder="??????????????????"
                      style={{ width: '100%' }}
                      onChange={(e) => {
                        this.setState({ remoteIpAddress: e.target.value });
                      }}
                      onSearch={(e) => this.actionInitPreConnection(e)}
                    />
                  </AutoComplete>
                </Spin>
              </div>
            </div>
          </div>
          <div className={styles.deviceInfo} style={{ marginTop: '3em' }}>
            <h1 className={styles.topTitle}>??????????????????</h1>
            <div className={styles.infoBlock}>
              <div className={styles.title}>????????????</div>
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
              <div className={styles.title}>????????????</div>
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
                      title: '??????',
                      content: '????????????????????????????????????',
                      onOk: this.actionReflushPwd,
                      okText: '??????',
                      cancelText: '??????',
                    })
                  }
                >
                  ????????????
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
