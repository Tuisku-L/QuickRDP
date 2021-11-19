import React from 'react';

import { Button, Dropdown, Menu } from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  DesktopOutlined,
  CloseSquareOutlined,
  DownOutlined,
  DoubleRightOutlined,
} from '@ant-design/icons';

import styles from './styles.less';

interface IState {
  sdImg: string;
  isFull: boolean;
  hasMultipleScreen: boolean;
  currentScreen: string;
  hiddenTools: boolean;
  isToggle: boolean;
  isInit: boolean;
  displayInfo: RDP.DisplayInfo[];
}

export default class Index extends React.Component<any, IState> {
  imgRef: HTMLCanvasElement | null = null;
  imgContext: CanvasRenderingContext2D | null = null;
  videoRef: HTMLVideoElement | null = null;
  remoteWs: typeof window.socketLocal | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      sdImg: '',
      isFull: false,
      hasMultipleScreen: true,
      currentScreen: '屏幕 1',
      hiddenTools: false,
      isToggle: false,
      isInit: false,
      displayInfo: [],
    };
  }

  componentDidMount = async () => {
    window.ipcRenderer.on(
      'initRemote',
      async (
        _: any,
        data: { remoteIp: string; displayInfo: RDP.DisplayInfo[] },
      ) => {
        const { remoteIp, displayInfo } = data;
        const deviceId = utools.getNativeId();
        console.info('displayInfo', displayInfo);
        window.deviceId = deviceId;
        this.setState(
          {
            isInit: true,
            displayInfo,
          },
          async () => {
            await this.actionInitRemote(remoteIp);
          },
        );
      },
    );
  };

  actionInitRemote = async (wsServer: string) => {
    const config = {
      iceServers: [],
    };
    const conn = new RTCPeerConnection(config);

    this.remoteWs = window.socketClient.connect(`ws://${wsServer}:9550`);

    conn.onicecandidate = (e) => {
      console.info('e', e);
      if (e.candidate) {
        console.info('e.candidate', e.candidate);
        conn.addIceCandidate(new RTCIceCandidate(e.candidate));
        if (this.remoteWs) {
          this.remoteWs.emit('rdp_answer_cecandidate', {
            deviceId: window.deviceId,
            data: e.candidate,
          });
        }
      }
    };

    // @ts-ignore
    conn.onaddstream = (e) => {
      console.info('addsteam', e);
      if (this.videoRef) {
        this.videoRef.srcObject = e.stream;
      }
    };

    const user = window.utools.getUser();

    this.remoteWs!.emit('rdp_connection_ready', {
      deviceId: window.deviceId,
    });

    this.remoteWs!.on('rdp_webrtc_offer', async (offer) => {
      if (offer.deviceId !== window.deviceId) {
        conn.setRemoteDescription(offer.data);
        const answer = await conn.createAnswer();
        conn.setLocalDescription(answer);
        this.remoteWs!.emit('rdp_webrtc_answer', {
          deviceId: window.deviceId,
          data: answer,
        });
      }
    });

    this.remoteWs!.on('rdp_offer_cecandidate', (data) => {
      if (data.deviceId !== window.deviceId) {
        console.info('get rdp_offer_cecandidate');
        conn.addIceCandidate(data.data);
      }
    });
  };

  actionDisconnection = () => {
    this.remoteWs?.emit('rdp_disconnection', {
      deviceId: window.deviceId,
      data: {},
    });
    this.remoteWs!.disconnect();
    setTimeout(() => {
      window.close();
    }, 1000);
  };

  actionOnClick = (event: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
    console.info('x: ', event.pageX, 'y: ', event.pageY);
    const { pageX, pageY } = event;
    if (this.remoteWs) {
      this.remoteWs.emit('rdp_event_click', {
        deviceId: window.deviceId,
        data: { x: pageX, y: pageY },
      });
    }
  };

  actionClickTools = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    func: Function,
  ) => {
    event.stopPropagation();
    func();
  };

  actionHoverTools = () => {
    if (!this.state.isToggle) {
      this.setState({
        hiddenTools: false,
      });
    }
  };

  public render() {
    const { isFull, hasMultipleScreen, currentScreen, hiddenTools, isInit } =
      this.state;

    if (!isInit) {
      return <div>Loading..</div>;
    }

    return (
      <div className={styles.remoteBox}>
        <div
          className={`${styles.toolsLine}${
            hiddenTools ? ` ${styles.hidden}` : ''
          }`}
          onMouseEnter={this.actionHoverTools}
        >
          <div className={styles.toolsBox}>
            <Button.Group>
              <Button type="primary" danger onClick={this.actionDisconnection}>
                <CloseSquareOutlined /> 结束连接
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  if (isFull) {
                    this.setState({
                      isFull: false,
                    });
                    document.exitFullscreen();
                  } else {
                    this.setState({
                      isFull: true,
                    });
                    document.documentElement.requestFullscreen();
                  }
                }}
              >
                {!isFull ? (
                  <span>
                    <FullscreenOutlined /> 进入全屏
                  </span>
                ) : (
                  <span>
                    <FullscreenExitOutlined /> 退出全屏
                  </span>
                )}
              </Button>
              {hasMultipleScreen && (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="1">1st menu item</Menu.Item>
                      <Menu.Item key="2">2nd menu item</Menu.Item>
                      <Menu.Item key="3">3rd menu item</Menu.Item>
                    </Menu>
                  }
                >
                  <Button type="primary">
                    <DesktopOutlined /> {currentScreen} <DownOutlined />
                  </Button>
                </Dropdown>
              )}
              <Button
                type="primary"
                onClick={() => this.setState({ hiddenTools: true })}
              >
                <span className={styles.hiddenBtn}>
                  <DoubleRightOutlined />
                </span>
                &nbsp;隐藏
              </Button>
            </Button.Group>
          </div>
        </div>
        <video
          autoPlay
          onClick={this.actionOnClick}
          ref={(ref) => (this.videoRef = ref)}
          className={styles.remoteVideo}
        />
      </div>
    );
  }
}
