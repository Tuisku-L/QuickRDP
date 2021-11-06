export {};

declare global {
  interface Window {
    setLoading(isLoading: boolean): void;
    execShell: {
      exec(cmd: string): { stdout: { on: Function }; stderr: { on: Function } };
    };
    __dirname: string;
    terminalType: 'Terminal' | 'iTerm' | 'cmd' | 'PowerShell';
    fs: any;
    os: any;
    socketClient: any;
    socketServer: any;
    socketLocal: {
      on: (
        name: string,
        callback: (data: { deviceId: string; data: any }) => any,
      ) => {};
      emit: Function;
      disconnect: Function;
    };
    desktopCapturer: any;
    displaysInfo: Array<RDP.DisplayInfo>;
    remoteWs: any;
    deviceId: string;
    ipcRenderer: any;
  }
}
