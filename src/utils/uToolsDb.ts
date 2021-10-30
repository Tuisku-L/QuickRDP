import { Group, Host } from '@/@types/entities';

export function getHost(id: string): Host {
  return window.utools.db.get<Host>(id);
}

export function createOrUpdateHost(host: Host): boolean {
  const result = window.utools.db.put(host);
  return result.ok;
}

export function GetHostsByGroupId(groupId: string): Array<Host> {
  return window.utools.db.allDocs<Host>(`host|${groupId}`);
}

export function removeHost(hostId: string) {
  const result = window.utools.db.remove(hostId);
  return result.ok;
}

export function GetGroups(): Array<Group> {
  return window.utools.db.allDocs<Group>('group');
}

export function GetGroup(id: string): Group {
  return window.utools.db.get<Group>(id);
}

export function createOrUpdateGroup(group: Group): boolean {
  const result = window.utools.db.put(group);
  return result.ok;
}

export function removeGroup(groupId: string) {
  const result = window.utools.db.remove(groupId);
  return result.ok;
}

export function addFixed(hostId: string): boolean {
  const result = window.utools.db.get('fixed_list');
  if (!result) {
    const fixedList = {
      _id: `fixed_list`,
      list: [hostId],
    };

    const addResult = window.utools.db.put(fixedList);
    return addResult.ok;
  }

  result.list.push(hostId);
  const upadteResult = window.utools.db.put(result);
  return upadteResult.ok;
}

export function removeFixed(hostId: string): boolean {
  const result = window.utools.db.get('fixed_list');
  result.list = result.list.filter((x: string) => x !== hostId);

  const removeResult = window.utools.db.put(result);
  return removeResult.ok;
}

export function getFixedHosts() {
  const result = window.utools.db.get('fixed_list');
  if (!result) {
    const fixedList = {
      _id: `fixed_list`,
      list: [],
    };

    window.utools.db.put(fixedList);
    return [];
  }
  return window.utools.db.allDocs<Host>(result.list);
}

export function getTerminalType(): 'Terminal' | 'iTerm' | 'cmd' | 'PowerShell' {
  const result =
    window.utools.db.get<{
      _id: string;
      type: 'Terminal' | 'iTerm' | 'cmd' | 'PowerShell';
    }>('terminal_type');
  let type: 'Terminal' | 'iTerm' | 'cmd' | 'PowerShell' = 'Terminal';
  if (!result) {
    if (window.utools.isMacOs()) {
      window.utools.db.put({
        _id: 'terminal_type',
        type: 'Terminal',
      });

      type = 'Terminal';
    }

    if (window.utools.isWindows()) {
      window.utools.db.put({
        _id: 'terminal_type',
        type: 'cmd',
      });

      type = 'cmd';
    }
  } else {
    if (window.utools.isMacOs()) {
      if (['Terminal', 'iTerm'].includes(type)) {
        type = result.type;
      } else {
        type = 'Terminal';
        changeTerminalType('Terminal');
      }
    }
    if (window.utools.isWindows()) {
      if (['cmd', 'PowerShell'].includes(type)) {
        type = result.type;
      } else {
        type = 'cmd';
        changeTerminalType('cmd');
      }
    }
    if (window.utools.isLinux()) {
      type = result.type;
    }
  }

  return type;
}

export function changeTerminalType(
  type: 'Terminal' | 'iTerm' | 'cmd' | 'PowerShell' | string,
) {
  const result =
    window.utools.db.get<{
      _id: string;
      type: string | 'Terminal' | 'iTerm' | 'cmd' | 'PowerShell';
    }>('terminal_type');
  result.type = type;
  const changeResult = window.utools.db.put(result);

  return changeResult.ok;
}
