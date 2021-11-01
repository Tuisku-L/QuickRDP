import React from 'react'

interface IState {
  sdImg: string;
}


export default class Index extends React.Component<any, IState>{
  imgRef: HTMLCanvasElement | null = null;
  imgContext: CanvasRenderingContext2D | null = null;
  videoRef: HTMLVideoElement | null = null;
  videoRef2: HTMLVideoElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = {
      sdImg: ""
    }
  }

  componentDidMount = async () => {
    // alert(1)
    // if (this.imgRef) {
    //   this.imgContext = this.imgRef.getContext("2d");
    // };
    // let blob = new Blob();
    // let int8Array = new Int8Array();
    // let img = new Image();
    // setInterval(async () => {
    //   window.utools.screenCapture((base64: string) => {
    //     img.src = base64;
    //     if (this.imgContext) {
    //       this.imgContext.drawImage(img, 0, 0)

    //     }
    //   });
    //   // const sdImg = await window.screenshotDesktop();
    //   // if (this.imgContext) {
    //   //   int8Array = new Int8Array(sdImg);
    //   //   blob = new Blob([int8Array]);
    //   //   const imageBitmap = await createImageBitmap(blob);
    //   //   this.imgContext.drawImage(imageBitmap, 0, 0)
    //   // }
    // }, 5)
    const display = window.utools.getPrimaryDisplay()
    const sources = await window.desktopCapturer.getSources({
      types: ["screen"]
    });
    console.info("display", display, sources);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // @ts-ignore
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: "screen:1:0"
          }
        },
      });
      console.info("stream", stream);
      if (this.videoRef2) {
        this.videoRef2.srcObject = stream;
      }
      this.actionStartPeerConnection(stream)
    } catch (error) {
      console.info("error", error);
    }
  }

  actionOnClick = (event: React.MouseEvent<HTMLVideoElement, MouseEvent>) => {
    console.info("x: ", event.clientX, "y: ", event.clientY);
    const { clientX, clientY } = event;
    window.utools.simulateMouseClick(clientX, clientY);
  }

  actionStartPeerConnection = async (stream: MediaStream) => {
    const config = {
      iceServers: []
    };
    const connectionSelf = new RTCPeerConnection(config);
    const connectionRemote = new RTCPeerConnection(config);

    connectionSelf.onicecandidate = (e) => {
      console.info("e", e);
      if (e.candidate) {
        console.info("e.candidate", e.candidate);
        connectionRemote.addIceCandidate(new RTCIceCandidate(e.candidate));
      }
    };

    connectionRemote.onicecandidate = (e) => {
      console.info("e", e);
      if (e.candidate) {
        console.info("e.candidate", e.candidate);
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
  }

  public render() {
    const { sdImg } = this.state;

    return <div>
      <div>
        <video
          autoPlay
          onClick={this.actionOnClick}
          ref={ref => this.videoRef = ref}
          width={500}
          style={{ border: "5px solid red" }}
        />
        <br />
        <video
          autoPlay
          onClick={this.actionOnClick}
          ref={ref => this.videoRef2 = ref}
          width={500}
          style={{ border: "5px solid green" }}
        />
      </div>
    </div>;
  }
}
