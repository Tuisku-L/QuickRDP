declare namespace utools {
  interface ShowOpenDialogOptions {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    properties?: Array<string>;
    message?: string;
  }

  export function onPluginReady(callback: Function): void;
  export function showOpenDialog(
    options: ShowOpenDialogOptions,
  ): Array<string> | undefined;
  export function showNotification(
    body: string,
    clickFeatureCode?: string,
  ): void;
  export function getPath(name: string): string;

  export function isMacOs(): boolean;
  export function isWindows(): boolean;
  export function isLinux(): boolean;
  export function isDev(): boolean;

  export function simulateMouseClick(x: number, y: number): void;
  export function simulateMouseMove(x: number, y: number): void;
  export function simulateMouseDoubleClick(x: number, y: number): void;

  export function simulateKeyboardTap(...args: string[]): void;

  export function getUser(): {
    avatar: string;
    nickname: string;
    type: 'member' | 'user';
  } | null;

  export function shellOpenExternal(url: string): void;

  export function screenCapture(callback: Function): void;
  export function getPrimaryDisplay(): any;
  export function getAllDisplays(): any;
  export function getNativeId(): string;

  export function createBrowserWindow(
    url: string,
    options?: any,
    callback?: Function,
  ): any;

  export namespace db {
    interface DbObject {
      _id: string;
      _rev?: string;
    }

    interface AnonymousDbObject extends DbObject {
      [key: string]: any;
    }

    interface DbResult {
      id: string;
      ok: boolean;
      rev: string;
    }

    export function put<T extends DbObject>(doc: T): DbResult;
    export function get(id: string): AnonymousDbObject;
    export function get<T extends DbObject>(id: string): T;
    export function remove<T extends DbObject>(doc: string | T): DbResult;
    export function bulkDocs<T extends DbObject>(
      docs: Array<T extends DbObject ? T : any>,
    ): Array<DbResult>;
    export function allDocs(
      key?: string | Array<string>,
    ): Array<AnonymousDbObject>;
    export function allDocs<T extends DbObject>(
      key?: string | Array<string>,
    ): Array<T>;
    export function putAttachment(
      docId: string,
      attachmentId: string,
      rev: string | null,
      attachment: Buffer | Uint8Array,
      type: string,
    ): DbResult;
    export function getAttachment(
      docId: string,
      attachmentId: string,
    ): Uint8Array;
    export function removeAttachment(
      docId: string,
      attachmentId: string,
      rev: string,
    ): DbResult;
  }
}
