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
}

export default class Index extends React.Component<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      userInfo: null,
      activePage: 'index',
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
  }

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
        window.socketLocal.emit('rdp_offer_cecandidate', e.candidate);
      }
    };

    const stream = await this.actionGetDisplayStream();
    // @ts-ignore
    conn.addStream(stream);

    window.socketLocal = window.socketClient.connect('ws://localhost:9550');

    window.socketLocal.on('rdp_pre_connection', async (data) => {
      const offer = await conn.createOffer();
      conn.setLocalDescription(offer);
      console.info('生成 offer', offer);
      window.socketLocal.emit('rdp_webrtc_offer', offer);
    });

    window.socketLocal.on('rdp_webrtc_answer', async (answer) => {
      conn.setRemoteDescription(answer);
    });

    window.socketLocal.on('rdp_answer_cecandidate', async (data) => {
      console.info('get rdp_answer_cecandidate');
      conn.addIceCandidate(data);
    });
  };

  actionGetDisplayStream = async () => {
    const display = window.utools.getPrimaryDisplay();
    const sources = await window.desktopCapturer.getSources({
      types: ['screen'],
    });
    console.info('display', display, sources);
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
    const { userInfo, activePage } = this.state;

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
            {this.props.children}
          </Col>
        </Row>
      </div>
    );
  }
}
