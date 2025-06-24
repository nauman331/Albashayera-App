import { PermissionsAndroid, Platform, Permission } from 'react-native';

// Only request image/media permissions, not document/PDF permissions
export async function requestMediaPermissions() {
  if (Platform.OS !== 'android') return true;
  try {
    const permissions: Permission[] = [];
    const apiLevel = Platform.Version;
    if (apiLevel >= 33) {
      // Android 13+ (Tiramisu)
      permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO);
    } else {
      // Below Android 13
      permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
  } catch (err) {
    return false;
  }
}
