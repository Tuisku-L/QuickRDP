import React from 'react'
import aaa from "screenshot-desktop";

interface IState {
  sdImg: string;
}


export default class Index extends React.Component<any, IState>{
  imgRef: HTMLCanvasElement | null = null;
  imgContext: CanvasRenderingContext2D | null = null;
  constructor(props: any) {
    super(props);
    this.state = {
      sdImg: ""
    }
  }

  componentDidMount = async () => {
    if (this.imgRef) {
      this.imgContext = this.imgRef.getContext("2d");
    };
    let blob = new Blob();
    let int8Array = new Int8Array();
    setInterval(async () => {
      const sdImg = await window.screenshotDesktop();
      if (this.imgContext) {
        int8Array = new Int8Array(sdImg);
        blob = new Blob([int8Array]);
        const imageBitmap = await createImageBitmap(blob);
        this.imgContext.drawImage(imageBitmap, 0, 0)
      }
    }, 5)
  }

  actionOnClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    console.info("x: ", event.clientX, "y: ", event.clientY);
    const { clientX, clientY } = event;
    window.utools.simulateMouseClick(clientX, clientY);
  }

  public render() {
    const { sdImg } = this.state;

    return <div>
      <div>
        <canvas
          ref={ref => this.imgRef = ref}
          height="400"
          width="800"
          onClick={this.actionOnClick}
        />
      </div>
    </div>;
  }
}
