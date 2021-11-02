import React from 'react';

interface IState {
  sdImg: string;
}

export default class Index extends React.Component<any, IState> {
  imgRef: HTMLCanvasElement | null = null;
  imgContext: CanvasRenderingContext2D | null = null;
  videoRef: HTMLVideoElement | null = null;
  remoteWs: any = null;

  constructor(props: any) {
    super(props);
    this.state = {
      sdImg: '',
    };
  }

  componentDidMount = async () => {
    console.info('123123');
    await this.actionInitRemote('ws://192.168.60.100:9550');
  };

  actionInitRemote = async (wsServer: string) => {
    const config = {
      iceServers: [],
    };
    const conn = new RTCPeerConnection(config);
    window.conn = conn;

    this.remoteWs = window.socketClient.connect(wsServer);

    conn.onicecandidate = (e) => {
      console.info('e', e);
      if (e.candidate) {
        console.info('e.candidate', e.candidate);
        conn.addIceCandidate(new RTCIceCandidate(e.candidate));
        this.remoteWs.emit('rdp_answer_cecandidate', e.candidate);
      }
    };

    // @ts-ignore
    conn.onaddstream = (e) => {
      console.info('addsteam', e);
      if (this.videoRef) {
        this.videoRef.srcObject = e.stream;
      }
    };

    this.remoteWs.emit('rdp_pre_connection', {});

    this.remoteWs.on('rdp_webrtc_offer', async (offer) => {
      conn.setRemoteDescription(offer);
      const answer = await conn.createAnswer();
      conn.setLocalDescription(answer);
      this.remoteWs.emit('rdp_webrtc_answer', answer);
    });

    this.remoteWs.on('rdp_offer_cecandidate', async (data) => {
      console.info('get rdp_offer_cecandidate');
      conn.addIceCandidate(data);
    });
  };

  actionOnClick = (event: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
    console.info('x: ', event.clientX, 'y: ', event.clientY);
    const { clientX, clientY } = event;
    if (this.remoteWs) {
      this.remoteWs.emit("rdp_event_click", { x: clientX, y: clientY });
    }
  };

  public render() {
    const { sdImg } = this.state;

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
