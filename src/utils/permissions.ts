import { PermissionsAndroid, Platform } from 'react-native';

// Only request image/media permissions, not document/PDF permissions
export async function requestMediaPermissions() {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      // Removed READ_MEDIA_AUDIO and any document-related permissions
    ]);
    return Object.values(granted).every(status => status === PermissionsAndroid.RESULTS.GRANTED);
  } catch (err) {
    return false;
  }
}
