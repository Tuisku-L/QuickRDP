import React from 'react';

interface IState {
  sdImg: string;
}

export default class Index extends React.Component<any, IState> {
  imgRef: HTMLCanvasElement | null = null;
  imgContext: CanvasRenderingContext2D | null = null;
  videoRef: HTMLVideoElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      sdImg: '',
    };
  }

  componentDidMount = async () => {
    console.info('123123');
    await this.actionInitRemote('ws://192.168.2.221:9550');
  };

  actionInitRemote = async (wsServer: string) => {
    const config = {
      iceServers: [],
    };
    const conn = new RTCPeerConnection(config);
    window.conn = conn;

    const remoteWs = window.socketClient.connect(wsServer);

    conn.onicecandidate = (e) => {
      console.info('e', e);
      if (e.candidate) {
        console.info('e.candidate', e.candidate);
        conn.addIceCandidate(new RTCIceCandidate(e.candidate));
        remoteWs.emit('rdp_answer_cecandidate', e.candidate);
      }
    };

    // @ts-ignore
    conn.onaddstream = (e) => {
      console.info('addsteam', e);
      if (this.videoRef) {
        this.videoRef.srcObject = e.stream;
      }
    };

    remoteWs.emit('rdp_pre_connection', {});

    remoteWs.on('rdp_webrtc_offer', async (offer) => {
      conn.setRemoteDescription(offer);
      const answer = await conn.createAnswer();
      conn.setLocalDescription(answer);
      remoteWs.emit('rdp_webrtc_answer', answer);
    });

    remoteWs.on('rdp_offer_cecandidate', async (data) => {
      console.info('get rdp_offer_cecandidate');
      conn.addIceCandidate(data);
    });
  };

  actionOnClick = (event: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
    console.info('x: ', event.clientX, 'y: ', event.clientY);
    const { clientX, clientY } = event;
    window.utools.simulateMouseClick(clientX, clientY);
  };

  actionStartPeerConnection = async (stream: MediaStream) => {
    const config = {
      iceServers: [],
    };
    const connectionSelf = new RTCPeerConnection(config);
    const connectionRemote = new RTCPeerConnection(config);

    connectionSelf.onicecandidate = (e) => {
      console.info('e', e);
      if (e.candidate) {
        console.info('e.candidate', e.candidate);
        connectionRemote.addIceCandidate(new RTCIceCandidate(e.candidate));
      }
    };

    connectionRemote.onicecandidate = (e) => {
      console.info('e', e);
      if (e.candidate) {
        console.info('e.candidate', e.candidate);
        connectionSelf.addIceCandidate(new RTCIceCandidate(e.candidate));
      }
    };

    // @ts-ignore
    connectionRemote.onaddstream = (e) => {
      if (this.videoRef) {
        this.videoRef.srcObject = e.stream;
      }
    };

    // @ts-ignore
    connectionSelf.addStream(stream);

    const offer = await connectionSelf.createOffer();
    connectionSelf.setLocalDescription(offer);
    connectionRemote.setRemoteDescription(offer);

    const answer = await connectionRemote.createAnswer();
    connectionRemote.setLocalDescription(answer);
    connectionSelf.setRemoteDescription(answer);
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
            width={500}
            style={{ border: '5px solid red' }}
          />
        </div>
      </div>
    );
  }
}
