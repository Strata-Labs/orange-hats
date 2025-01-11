import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  acceptedTypes?: Record<string, string[]>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isUploading = false,
  acceptedTypes = {
    "application/pdf": [".pdf"],
  },
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-colors cursor-pointer
        ${
          isDragActive
            ? "border-main-orange bg-main-orange/10"
            : "border-main-dark-grey"
        }
        ${isDragReject ? "border-red-500 bg-red-500/10" : ""}
        hover:border-main-orange hover:bg-main-orange/5`}
    >
      <input {...getInputProps()} />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-main-orange animate-spin" />
          <p className="text-secondary-white">Uploading file...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-8 h-8 text-main-orange" />
          <p className="text-secondary-white text-center">
            {isDragActive
              ? "Drop the file here"
              : "Drag and drop a file here, or click to select"}
          </p>
          {isDragReject && (
            <p className="text-red-500 text-sm">
              Only {Object.keys(acceptedTypes).join(", ")} files are accepted
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
