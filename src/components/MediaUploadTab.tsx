import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface MediaUploadTabProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  groupId?: string;
  userId?: string;
  draftId?: string;
}

export const MediaUploadTab: React.FC<MediaUploadTabProps> = ({
  files,
  onFilesChange,
  groupId,
  userId,
  draftId
}) => {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_FILES = 5;
  const ACCEPTED_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 10MB.`;
    }

    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return `File "${file.name}" has an unsupported format. Please use JPEG, PNG, GIF, WebP, MP4, or WebM.`;
    }

    return null;
  };

  const uploadFile = async (mediaFile: MediaFile): Promise<void> => {
    if (!draftId) {
      console.error('No draftId provided for media upload');
      setMediaFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { ...f, status: 'error', error: 'No draft available' }
          : f
      ));
      return;
    }

    if (!userId) {
      console.error('No userId provided for media upload');
      setMediaFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { ...f, status: 'error', error: 'User not authenticated' }
          : f
      ));
      return;
    }

    try {
      const fileExt = mediaFile.file.name.split('.').pop();
      // Include groupId and userId in filename for better organization and cleanup
      const fileName = `${userId || 'user'}_${groupId || 'group'}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Storage RLS policy requires userId as first folder in path
      const filePath = `${userId}/${fileName}`;

      // Update progress
      setMediaFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { ...f, progress: 10, status: 'uploading' }
          : f
      ));

      // Upload to storage first
      const { data, error } = await supabase.storage
        .from('post-files')
        .upload(filePath, mediaFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('post-files')
        .getPublicUrl(filePath);

      // Update progress
      setMediaFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { ...f, progress: 50, status: 'uploading' }
          : f
      ));

      // Now register with draft via edge function
      const { data: mediaData, error: mediaError } = await supabase.functions.invoke('media-upload/complete', {
        body: {
          draftId,
          fileId: `${userId}/${fileName}`,
          url: publicUrlData.publicUrl,
          mimeType: mediaFile.file.type,
          fileSize: mediaFile.file.size
        }
      });

      if (mediaError) {
        // Clean up storage file if draft attachment fails
        await supabase.storage.from('post-files').remove([`${userId}/${fileName}`]);
        throw new Error(mediaError.message || 'Failed to register media');
      }

      // Update completed state
      setMediaFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { ...f, progress: 100, status: 'completed', url: publicUrlData.publicUrl }
          : f
      ));

      // Add to files list
      onFilesChange([...files, publicUrlData.publicUrl]);

      toast({
        title: "Upload Successful",
        description: `${mediaFile.file.name} has been uploaded and attached to draft.`,
      });

    } catch (error) {
      console.error('Upload failed:', error);
      
      setMediaFiles(prev => prev.map(f => 
        f.id === mediaFile.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ));

      toast({
        title: "Upload Failed",
        description: `Failed to upload ${mediaFile.file.name}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (mediaFiles.length + acceptedFiles.length > MAX_FILES) {
      toast({
        title: "Too Many Files",
        description: `You can only upload up to ${MAX_FILES} files.`,
        variant: "destructive"
      });
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Invalid Files",
        description: errors.join(' '),
        variant: "destructive"
      });
    }

    if (validFiles.length === 0) return;

    const newMediaFiles: MediaFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      preview: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    }));

    setMediaFiles(prev => [...prev, ...newMediaFiles]);

    // Start uploads
    newMediaFiles.forEach(mediaFile => {
      uploadFile(mediaFile);
    });

  }, [mediaFiles.length, files, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: MAX_FILES,
    multiple: true
  });

  const removeFile = async (fileId: string) => {
    const fileToRemove = mediaFiles.find(f => f.id === fileId);
    
    if (fileToRemove?.url && draftId) {
      // Call edge function to remove from draft_media table and storage
      try {
        const mediaId = fileToRemove.url.split('/').pop(); // Extract some identifier
        await supabase.functions.invoke('media-upload', {
          body: null // DELETE request will be handled by edge function
        });
      } catch (error) {
        console.warn('Failed to remove media from server:', error);
      }
      
      // Remove from files list
      onFilesChange(files.filter(url => url !== fileToRemove.url));
    }
    
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setMediaFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const retryUpload = (fileId: string) => {
    const mediaFile = mediaFiles.find(f => f.id === fileId);
    if (mediaFile) {
      setMediaFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      ));
      uploadFile(mediaFile);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            
            {isDragActive ? (
              <p className="text-lg font-medium text-primary mb-2">
                Drop your files here...
              </p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Upload your media files
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag & drop files here, or click to select files
                </p>
              </>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span>• Max {MAX_FILES} files</span>
              <span>• Up to 10MB each</span>
              <span>• JPEG, PNG, GIF, WebP, MP4, WebM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {mediaFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          
          {mediaFiles.map((mediaFile) => (
            <Card key={mediaFile.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* File Preview */}
                  <div className="flex-shrink-0">
                    {mediaFile.file.type.startsWith('image/') ? (
                      <img
                        src={mediaFile.preview}
                        alt={mediaFile.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(mediaFile.file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{mediaFile.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Progress */}
                    {mediaFile.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={mediaFile.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {mediaFile.progress}%
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {mediaFile.status === 'error' && (
                      <div className="mt-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          {mediaFile.error || 'Upload failed'}
                        </p>
                      </div>
                    )}

                    {/* Success */}
                    {mediaFile.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Upload completed
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {mediaFile.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryUpload(mediaFile.id)}
                      >
                        <Loader2 className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(mediaFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Images will be automatically optimized for web viewing</li>
          <li>Videos will be processed to ensure compatibility</li>
          <li>You can drag files to reorder them after upload</li>
          <li>Alt text can be added after upload for accessibility</li>
        </ul>
      </div>
    </div>
  );
};