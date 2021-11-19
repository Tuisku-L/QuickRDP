import React from 'react';
import { Link } from 'umi';

import { Row, Col, Avatar, Modal } from 'antd';

import styles from './styles.less';

interface IState {
  userInfo: {
    avatar: string;
    nickname: string;
    type: 'member' | 'user';
  } | null;
  activePage: 'index' | 'setting';
  isInit: boolean;
}

export default class Index extends React.Component<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      userInfo: null,
      activePage: 'index',
      isInit: false,
    };
  }

  componentDidMount() {
    window.utools.onPluginReady(() => {
      const deviceId = utools.getNativeId();
      window.deviceId = deviceId;

      const userInfo = window.utools.getUser();
      if (userInfo) {
        this.setState({
          userInfo,
        });
      }

      this.actionInitSetting();
      this.actionInitRemoteWebRTC();
      this.actionInitPwd();

      this.setState({
        isInit: true,
      });
    });
  }

  actionInitPwd = () => {
    let password = window.utools.db.get<RDP.Password>(
      `${window.deviceId}/currentPwd`,
    );
    if (!password) {
      password = {
        _id: `${window.deviceId}/currentPwd`,
        password: Math.floor(
          Math.random() * (999999 - 100000 + 1) + 100000,
        ).toString(),
      };
      window.utools.db.put(password);
    } else {
      const setting = window.utools.db.get<RDP.Setting>(
        `${window.deviceId}/rdp_setting`,
      );
      if (setting.changePwd === 'onBoot') {
        password.password = Math.floor(
          Math.random() * (999999 - 100000 + 1) + 100000,
        ).toString();
        window.utools.db.put(password);
      }
    }
  };

  actionInitSetting = () => {
    const setting = window.utools.db.get<RDP.Setting>(
      `${window.deviceId}/rdp_setting`,
    );
    if (!setting) {
      const defaultSetting: RDP.Setting = {
        _id: `${window.deviceId}/rdp_setting`,
        vaildType: 'temp',
        personalPwd: '',
        changePwd: 'none',
        savePwd: true,
        selfConnect: false,
      };

      window.utools.db.put(defaultSetting);
    }
  };

  actionInitRemoteWebRTC = async () => {
    const config = {
      iceServers: [],
    };
    let conn = new RTCPeerConnection(config);

    conn.onicecandidate = (e) => {
      console.info('e', e);
      if (e.candidate) {
        console.info('e.candidate', e.candidate);
        window.socketLocal.emit('rdp_offer_cecandidate', {
          deviceId: window.deviceId,
          data: e.candidate,
        });
      }
    };

    const stream = await this.actionGetDisplayStream();
    // @ts-ignore
    conn.addStream(stream);

    window.socketLocal = window.socketClient.connect('ws://localhost:9550');

    window.socketLocal.on('rdp_change_display', async (data) => {
      if (data.deviceId !== window.deviceId) {
        const stream = await this.actionGetDisplayStream(data.data.id);
        console.info('data.data.id', data.data.id);
        // @ts-ignore
        conn.removeStream(stream);
        // @ts-ignore
        conn.addStream(stream);

        await this.actionCreateOffer(conn);
      }
    });

    window.socketLocal.on('rdp_disconnection', (data) => {
      if (data.deviceId !== window.deviceId) {
        window.socketLocal.disconnect();
        // @ts-ignore
        window.socketLocal = null;
        // @ts-ignore
        conn = null;
        this.actionInitRemoteWebRTC();
      }
    });

    window.socketLocal.on('rdp_pre_connection', (data) => {
      console.info('rdp_pre_connection', data, window.deviceId);
      if (data.deviceId !== window.deviceId) {
        const setting = window.utools.db.get<RDP.Setting>(
          `${window.deviceId}/rdp_setting`,
        );
        const user = window.utools.getUser();

        if (data.data.userHash && data.data.userHash !== '') {
          console.info(
            'setting.selfConnect',
            setting.selfConnect,
            data.data.userHash,
            user?.avatar,
          );
          if (setting.selfConnect && data.data.userHash === user?.avatar) {
            window.socketLocal.emit('rdp_remote_info', {
              deviceId: window.deviceId,
              data: {
                verifyType: 'none',
                displayInfo: window.displaysInfo,
              },
            });
            return;
          }
        }

        window.socketLocal.emit('rdp_remote_info', {
          deviceId: window.deviceId,
          data: { verifyType: 'password' },
        });
      }
    });

    window.socketLocal.on('rdp_login_try', async (data) => {
      if (data.deviceId !== window.deviceId) {
        const pwd = data.data.password;
        const setting = window.utools.db.get<RDP.Setting>(
          `${window.deviceId}/rdp_setting`,
        );
        const user = window.utools.getUser();

        const personalPwd = setting.personalPwd;
        const currentPwd = window.utools.db.get<RDP.Password>(
          `${window.deviceId}/currentPwd`,
        ).password;

        if (setting.selfConnect) {
          if (pwd === user?.avatar) {
            this.actionSendLoginSuccess();
            return;
          }
        }

        if (setting.vaildType === 'both') {
          if (personalPwd === pwd || currentPwd === pwd) {
            this.actionSendLoginSuccess();
            return;
          }
        }

        if (setting.vaildType === 'temp') {
          if (currentPwd === pwd) {
            this.actionSendLoginSuccess();
            return;
          }
        }

        if (setting.vaildType === 'personal') {
          if (personalPwd === pwd) {
            this.actionSendLoginSuccess();
            return;
          }
        }

        this.actionSendLoginFaild('密码验证失败');
      }
    });

    window.socketLocal.on('rdp_connection_ready', async (data) => {
      if (data.deviceId !== window.deviceId) {
        await this.actionCreateOffer(conn);
      }
    });

    window.socketLocal.on('rdp_webrtc_answer', (data) => {
      if (data.deviceId !== window.deviceId) {
        conn.setRemoteDescription(data.data);
      }
    });

    window.socketLocal.on('rdp_answer_cecandidate', (data) => {
      console.info('get rdp_answer_cecandidate');
      if (data.deviceId !== window.deviceId) {
        conn.addIceCandidate(data.data);
      }
    });

    window.socketLocal.on('rdp_event_click', (data) => {
      if (data.deviceId !== window.deviceId) {
        window.utools.simulateMouseClick(data.data.x, data.data.y);
      }
    });
  };

  actionSendLoginSuccess = () => {
    window.socketLocal.emit('rdp_login_success', {
      deviceId: window.deviceId,
      data: window.displaysInfo,
    });
  };

  actionSendLoginFaild = (msg: string) => {
    window.socketLocal.emit('rdp_login_faild', {
      deviceId: window.deviceId,
      data: msg,
    });
  };

  actionGetDisplayStream = async (id?: string) => {
    const displays = window.utools.getAllDisplays();
    console.info('displays', displays);
    const sources = await window.desktopCapturer.getSources({
      types: ['screen'],
    });

    console.info('sources', sources);

    const displaysInfo = displays.map((display: any) => {
      let displaySource = sources.find(
        (x: any) => x.display_id.toString() === display.id.toString(),
      );
      if (!displaySource) {
        if (sources.length > 0) {
          displaySource = sources[0];
        } else {
          Modal.warning({
            title: '提示',
            content: '无法装载显示器适配文件，可能无法远程操控此设备',
          });
          return null;
        }
      }
      const displayInfo = {
        id: displaySource.id,
        display_id: displaySource.display_id,
        size: {
          width: display.bounds.width,
          height: display.bounds.height,
        },
      };
      return displayInfo;
    });

    console.info('displaysInfo', displaysInfo);
    window.displaysInfo = displaysInfo;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // @ts-ignore
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: id || displaysInfo[0].id,
          },
        },
      });
      console.info('stream', stream);
      return stream;
    } catch (error) {
      console.info('error', error);
    }
  };

  actionCreateOffer = async (conn: RTCPeerConnection) => {
    const offer = await conn.createOffer();
    conn.setLocalDescription(offer);
    console.info('生成 offer', offer);
    window.socketLocal.emit('rdp_webrtc_offer', {
      deviceId: window.deviceId,
      data: offer,
    });
  };

  actionShowInfo = () => {
    const mainWindow: { size: { width: number; height: number } } =
      window.utools.getPrimaryDisplay();
    const x = mainWindow.size.width - 300;
    const y = mainWindow.size.height - 300;
    const infoWindow = window.utools.createBrowserWindow(
      'info.html',
      {
        width: 300,
        height: 300,
        resizable: false,
        minimizable: false,
        maximizable: false,
        skipTaskbar: true,
        alwaysOnTop: true,
        frame: false,
        x,
        y,
        webPreferences: {
          preload: './lib/info_preload.js',
        },
      },
      () => {
        if (window.utools.isDev()) {
          infoWindow.webContents.openDevTools();
        }
        window.ipcRenderer.sendTo(infoWindow.webContents.id, 'remoteInfo', {});
        console.info(':sdf', infoWindow);
      },
    );

    window.ipcRenderer.on('info_close', () => {
      if (infoWindow) {
        infoWindow.close();
      }
    });

    window.ipcRenderer.on('info_hide', () => {
      if (infoWindow) {
        infoWindow.setSize(20, 300);
        const x = mainWindow.size.width - 20;
        const y = mainWindow.size.height - 300;
        infoWindow.setPosition(x, y);
      }
    });

    window.ipcRenderer.on('info_show', () => {
      if (infoWindow) {
        infoWindow.setSize(300, 300);
        const x = mainWindow.size.width - 300;
        const y = mainWindow.size.height - 300;
        infoWindow.setPosition(x, y);
      }
    });
  };

  public render() {
    const { userInfo, activePage, isInit } = this.state;

    return (
      <div
        className={styles.mainBox}
        style={{ backgroundImage: 'url("mainBg.jpg")' }}
      >
        <Row className={styles.contentBox}>
          <Col span={6} className={styles.leftNav}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                <Avatar src={userInfo?.avatar} size={64} />
              </div>
              <div className={styles.userName}>{userInfo?.nickname}</div>
            </div>
            <div className={styles.menu}>
              <Link
                to="/"
                onClick={() => this.setState({ activePage: 'index' })}
              >
                <div
                  className={`${styles.line}${
                    activePage === 'index' ? ` ${styles.active}` : ''
                  }`}
                >
                  设备信息
                </div>
              </Link>
              <Link
                to="/setting"
                onClick={() => this.setState({ activePage: 'setting' })}
              >
                <div
                  className={`${styles.line}${
                    activePage === 'setting' ? ` ${styles.active}` : ''
                  }`}
                >
                  高级设置
                </div>
              </Link>
              <div
                className={`${styles.line}${
                  activePage === 'setting' ? ` ${styles.active}` : ''
                }`}
                onClick={this.actionShowInfo}
              >
                test
              </div>
            </div>
          </Col>
          <Col span={18} className={styles.mainInfo}>
            {isInit && this.props.children}
          </Col>
        </Row>
      </div>
    );
  }
}
