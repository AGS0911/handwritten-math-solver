
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabaseClient';

interface ImageUploaderProps {
  onSolutionReceived: (solution: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function ImageUploader({ onSolutionReceived, setIsLoading }: ImageUploaderProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsLoading(true);
    setUploadError(null);
    setDebugInfo(null);

    try {
      console.log('File upload started');
      const file = acceptedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setDebugInfo('Uploading to Supabase...');
      console.log('Uploading to Supabase:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('math-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
      }

      setDebugInfo('Image uploaded, calling API...');
      console.log('File uploaded successfully, calling API');

      const response = await fetch('/api/solve-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath: filePath })
      });

      console.log('API response status:', response.status);
      setDebugInfo(`API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (data.error) throw new Error(data.error);

      onSolutionReceived(data.result);
      setDebugInfo('Success!');
    } catch (error: any) {
      console.error('Error in process:', error);
      setUploadError(error.message || 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  }, [onSolutionReceived, setIsLoading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop your image here</p>
        ) : (
          <div>
            <p className="mb-2">Drag & drop a handwritten math problem image here</p>
            <p className="text-sm text-gray-500">or click to select a file</p>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-center rounded-md text-sm">
          <p className="font-medium">Error:</p>
          <p>{uploadError}</p>
        </div>
      )}

      {debugInfo && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-center rounded-md text-sm">
          <p className="font-medium">Status:</p>
          <p>{debugInfo}</p>
        </div>
      )}
    </div>
  );
}