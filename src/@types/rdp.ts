namespace RDP {
  export interface Setting extends utools.db.DbObject {
    vaildType: 'temp' | 'personal' | 'both';
    personalPwd: string;
    changePwd: 'none' | 'onDisconnection' | 'onBoot';
    savePwd: boolean;
    selfConnect: boolean;
  }

  export interface DisplayInfo {
    id: string | number;
    display_id: string;
    size: {
      width: number;
      height: number;
    };
  }
}
