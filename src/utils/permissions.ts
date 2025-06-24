import { PermissionsAndroid, Platform, Permission } from 'react-native';

export async function requestMediaPermissions() {
  if (Platform.OS !== 'android') return true;
  try {
    const permissions: Permission[] = [];
    const apiLevel = Platform.Version;
    if (apiLevel >= 33) {
      permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
    } else {
      permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }

    // Check if all permissions are already granted
    const statuses = await PermissionsAndroid.check(permissions[0]);
    if (permissions.length === 2) {
      const statuses2 = await PermissionsAndroid.check(permissions[1]);
      if (statuses && statuses2) return true;
    } else if (statuses) {
      return true;
    }

    // Request only if not already granted
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
  } catch (err) {
    return false;
  }
}