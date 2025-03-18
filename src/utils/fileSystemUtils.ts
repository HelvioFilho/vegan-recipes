import * as FileSystem from 'expo-file-system';

export async function downloadImageFile(remoteUrl: string, fileName: string): Promise<string> {
  const imagesDir = FileSystem.documentDirectory + 'images/';

  const dirInfo = await FileSystem.getInfoAsync(imagesDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
  }

  const localUri = imagesDir + fileName;

  const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);
  return downloadResult.uri;
}

export async function deleteLocalFile(fileUri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
  }
}
