import * as FileSystem from 'expo-file-system';
import { downloadImageFile, deleteLocalFile } from '@/utils/fileSystemUtils';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://documentDir/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  downloadAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));

describe('fileSystemUtils', () => {
  const remoteUrl = 'http://example.com/image.jpg';
  const fileName = 'image.jpg';
  const imagesDir = 'file://documentDir/images/';
  const localUri = imagesDir + fileName;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadImageFile', () => {
    it('should create the directory if it does not exist and download the file', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: false });
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValueOnce(undefined);
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({ uri: localUri });

      const uri = await downloadImageFile(remoteUrl, fileName);

      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(imagesDir);
      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(imagesDir, {
        intermediates: true,
      });
      expect(FileSystem.downloadAsync).toHaveBeenCalledWith(remoteUrl, localUri);
      expect(uri).toBe(localUri);
    });

    it('should not create the directory if it already exists and download the file', async () => {
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({ exists: true });
      (FileSystem.downloadAsync as jest.Mock).mockResolvedValueOnce({ uri: localUri });

      const uri = await downloadImageFile(remoteUrl, fileName);

      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(imagesDir);
      expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
      expect(FileSystem.downloadAsync).toHaveBeenCalledWith(remoteUrl, localUri);
      expect(uri).toBe(localUri);
    });
  });

  describe('deleteLocalFile', () => {
    const fileUri = 'file://documentDir/images/image.jpg';

    it('should call deleteAsync with fileUri and options', async () => {
      (FileSystem.deleteAsync as jest.Mock).mockResolvedValueOnce(undefined);

      await deleteLocalFile(fileUri);

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(fileUri, { idempotent: true });
    });

    it('should catch errors and log them', async () => {
      const error = new Error('Delete failed');
      (FileSystem.deleteAsync as jest.Mock).mockRejectedValueOnce(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await deleteLocalFile(fileUri);

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(fileUri, { idempotent: true });
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao deletar arquivo:', error);

      consoleSpy.mockRestore();
    });
  });
});
