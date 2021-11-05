import React from 'react';
import { Link } from 'umi';

import { Row, Col, Avatar } from 'antd';

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
      const setting = window.utools.db.get<RDP.Setting>('rdp_setting');
      if (setting.changePwd === 'onBoot') {
        password.password = Math.floor(
          Math.random() * (999999 - 100000 + 1) + 100000,
        ).toString();
        window.utools.db.put(password);
      }
    }
  };

  actionInitSetting = () => {
    const setting = window.utools.db.get<RDP.Setting>('rdp_setting');
    if (!setting) {
      const defaultSetting: RDP.Setting = {
        _id: 'rdp_setting',
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
    const conn = new RTCPeerConnection(config);

    conn.onicecandidate = (e) => {
      console.info('e', e);
      if (e.candidate) {
        console.info('e.candidate', e.candidate);
        // conn.addIceCandidate(new RTCIceCandidate(e.candidate));
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

    window.socketLocal.on('rdp_pre_connection', async (data) => {
      if (data.deviceId !== window.deviceId) {
        const setting = window.utools.db.get<RDP.Setting>('rdp_setting');
        const user = window.utools.getUser();

        if (data.data.userHash && data.data.userHash !== '') {
          if (setting.selfConnect && data.data.userHash === user?.avatar) {
            window.socketLocal.emit('rdp_verify_type', {
              deviceId: window.deviceId,
              data: { verifyType: 'none' },
            });
            return;
          }
        }

        window.socketLocal.emit('rdp_verify_type', {
          deviceId: window.deviceId,
          data: { verifyType: 'password' },
        });
      }
    });

    window.socketLocal.on('rdp_verification', async (data) => {
      if (data.deviceId !== window.deviceId) {
        const pwd = data.data.pwd;
        const setting = window.utools.db.get<RDP.Setting>('rdp_setting');
        const personalPwd = setting.personalPwd;
      }
    });

    window.socketLocal.on('rdp_connection_ready', async (data) => {
      if (data.deviceId !== window.deviceId) {
        const offer = await conn.createOffer();
        conn.setLocalDescription(offer);
        console.info('生成 offer', offer);
        window.socketLocal.emit('rdp_webrtc_offer', {
          deviceId: window.deviceId,
          data: offer,
        });
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

  actionGetDisplayStream = async () => {
    const displays = window.utools.getAllDisplays();
    const sources = await window.desktopCapturer.getSources({
      types: ['screen'],
    });

    const displaysInfo = displays.map((display: any) => {
      const displaySource = sources.find(
        (x: any) => x.display_id.toString() === display.id.toString(),
      );
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
            chromeMediaSourceId: 'screen:1:0',
          },
        },
      });
      console.info('stream', stream);
      return stream;
    } catch (error) {
      console.info('error', error);
    }
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
              <Link to="/remote">
                <div
                  className={`${styles.line}${
                    activePage === 'setting' ? ` ${styles.active}` : ''
                  }`}
                >
                  test
                </div>
              </Link>
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
