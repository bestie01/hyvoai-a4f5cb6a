import { useState } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { useToast } from '@/hooks/use-toast';

export const useNativeFileSystem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveHighlight = async (videoData: string, filename: string) => {
    try {
      setIsLoading(true);
      const result = await Filesystem.writeFile({
        path: `highlights/${filename}`,
        data: videoData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      toast({
        title: "Highlight saved",
        description: `Saved to ${result.uri}`,
      });

      return result.uri;
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "Could not save highlight",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const readHighlight = async (filename: string) => {
    try {
      setIsLoading(true);
      const contents = await Filesystem.readFile({
        path: `highlights/${filename}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      return contents.data;
    } catch (error) {
      console.error('Read error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const listHighlights = async () => {
    try {
      setIsLoading(true);
      const result = await Filesystem.readdir({
        path: 'highlights',
        directory: Directory.Documents,
      });

      return result.files;
    } catch (error) {
      console.error('List error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHighlight = async (filename: string) => {
    try {
      setIsLoading(true);
      await Filesystem.deleteFile({
        path: `highlights/${filename}`,
        directory: Directory.Documents,
      });

      toast({
        title: "Highlight deleted",
        description: `${filename} removed`,
      });

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete highlight",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const permissions = await Filesystem.requestPermissions();
      return permissions.publicStorage === 'granted';
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  return {
    isLoading,
    saveHighlight,
    readHighlight,
    listHighlights,
    deleteHighlight,
    requestPermissions,
  };
};
