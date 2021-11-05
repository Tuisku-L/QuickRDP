import React from 'react';

interface IState {
  sdImg: string;
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
    };
  }

  componentDidMount = async () => {
    console.info('123123');
    await this.actionInitRemote('192.168.2.221');
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

    this.remoteWs!.emit('rdp_pre_connection', {
      deviceId: window.deviceId,
      data: {
        userHash: user?.avatar,
      },
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

  actionOnClick = (event: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
    console.info('x: ', event.clientX, 'y: ', event.clientY);
    const { clientX, clientY } = event;
    if (this.remoteWs) {
      this.remoteWs.emit('rdp_event_click', {
        deviceId: window.deviceId,
        data: { x: clientX, y: clientY },
      });
    }
  };

  public render() {
    return (
      <div>
        <div>
          <video
            autoPlay
            onClick={this.actionOnClick}
            ref={(ref) => (this.videoRef = ref)}
          />
        </div>
      </div>
    );
  }
}
