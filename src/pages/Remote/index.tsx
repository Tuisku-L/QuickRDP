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
  windowWidth: number;
  windowHeight: number;
  currentDisplayInfo: RDP.DisplayInfo | null;
  isHideCursor: boolean;
}

export default class Index extends React.Component<any, IState> {
  imgRef: HTMLCanvasElement | null = null;
  imgContext: CanvasRenderingContext2D | null = null;
  videoRef: HTMLVideoElement | null = null;
  remoteWs: typeof window.socketLocal | null = null;
  boxRef: HTMLDivElement | null = null;
  senderId: number = 0;

  constructor(props: any) {
    super(props);
    this.state = {
      sdImg: '',
      isFull: false,
      hasMultipleScreen: false,
      currentScreen: '屏幕 1',
      hiddenTools: false,
      isToggle: false,
      isInit: false,
      displayInfo: [],
      windowWidth: 0,
      windowHeight: 0,
      currentDisplayInfo: null,
      isHideCursor: true,
    };
  }

  componentDidMount = async () => {
    window.ipcRenderer.on(
      'initRemote',
      async (
        sender: { senderId: number },
        data: { remoteIp: string; displayInfo: RDP.DisplayInfo[] },
      ) => {
        const { remoteIp, displayInfo } = data;
        const deviceId = utools.getNativeId();
        console.info('displayInfo', displayInfo);
        window.deviceId = deviceId;
        this.senderId = sender.senderId;
        this.setState(
          {
            isInit: true,
            displayInfo,
            currentDisplayInfo: displayInfo[0],
            hasMultipleScreen: displayInfo.length > 1,
          },
          async () => {
            await this.actionInitRemote(remoteIp);
          },
        );
      },
    );

    window.addEventListener('resize', () => {
      if (this.videoRef && this.boxRef) {
        if (this.videoRef.offsetWidth > this.boxRef.offsetWidth) {
          this.boxRef.style.justifyContent = 'start';
        } else {
          this.boxRef.style.justifyContent = 'center';
        }

        this.setState({
          windowWidth: this.videoRef.offsetWidth,
          windowHeight: this.videoRef.offsetHeight,
        });
      }
    });
  };

  actionChangeDisplay = (displayInfo: RDP.DisplayInfo, index: number) => {
    if (this.remoteWs) {
      this.remoteWs.emit('rdp_change_display', {
        deviceId: window.deviceId,
        data: {
          id: displayInfo.id,
        },
      });
      this.setState({
        currentScreen: `屏幕 ${index + 1}`,
        currentDisplayInfo: displayInfo,
      });
    }
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
    const { windowHeight, windowWidth, currentDisplayInfo } = this.state;

    this.actionRectifyPos();

    if (this.videoRef) {
      this.videoRef.focus();
    }

    if (currentDisplayInfo) {
      const x_num = currentDisplayInfo.size.width / windowWidth;
      const y_num = currentDisplayInfo.size.height / windowHeight;

      console.info('x_num', x_num, y_num);

      const { offsetX, offsetY } = event.nativeEvent;
      if (this.remoteWs) {
        this.remoteWs.emit('rdp_event_click', {
          deviceId: window.deviceId,
          data: { x: offsetX * x_num, y: offsetY * y_num },
        });
      }
    }
  };

  actionOnMouseMove = (
    event: React.MouseEvent<HTMLVideoElement, MouseEvent>,
  ) => {
    const { windowHeight, windowWidth, currentDisplayInfo } = this.state;
    this.actionRectifyPos();
    if (currentDisplayInfo) {
      const x_num = currentDisplayInfo.size.width / windowWidth;
      const y_num = currentDisplayInfo.size.height / windowHeight;

      console.info('x_num', x_num, y_num);

      const { offsetX, offsetY } = event.nativeEvent;
      if (this.remoteWs) {
        this.remoteWs.emit('rdp_event_move', {
          deviceId: window.deviceId,
          data: { x: offsetX * x_num, y: offsetY * y_num },
        });
      }
    }
  };

  actionOnKeyPress = (e: React.KeyboardEvent<HTMLVideoElement>) => {
    console.info('e', e);
    e.preventDefault();
    if (this.remoteWs) {
      this.remoteWs.emit('rdp_event_keydown', {
        deviceId: window.deviceId,
        data: e.key.toLowerCase(),
      });
    }
  };

  actionRectifyPos = () => {
    if (this.videoRef) {
      this.setState({
        windowWidth: this.videoRef.offsetWidth,
        windowHeight: this.videoRef.offsetHeight,
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
    const {
      isFull,
      hasMultipleScreen,
      currentScreen,
      hiddenTools,
      isInit,
      displayInfo,
      isHideCursor,
    } = this.state;

    if (!isInit) {
      return <div>Loading..</div>;
    }

    return (
      <div className={styles.remoteBox} ref={(ref) => (this.boxRef = ref)}>
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
              <Button
                type="primary"
                onClick={() => {
                  this.setState({
                    isHideCursor: !isHideCursor,
                  });
                }}
              >
                <span>{isHideCursor ? '显示' : '隐藏'}本机光标</span>
              </Button>
              {hasMultipleScreen && (
                <Dropdown
                  overlay={
                    <Menu>
                      {displayInfo.map((x, index) => (
                        <Menu.Item
                          key={x.display_id}
                          onClick={() => this.actionChangeDisplay(x, index)}
                        >
                          屏幕{index + 1}
                        </Menu.Item>
                      ))}
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
          ref={(ref) => (this.videoRef = ref)}
          className={styles.remoteVideo}
          onClick={this.actionOnClick}
          onMouseMove={this.actionOnMouseMove}
          onKeyDown={this.actionOnKeyPress}
          style={{ cursor: isHideCursor ? 'none' : 'unset' }}
          contentEditable
        />
      </div>
    );
  }
}
