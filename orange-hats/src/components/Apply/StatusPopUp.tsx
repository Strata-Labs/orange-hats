import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface StatusPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  message: string;
}

const StatusPopup: React.FC<StatusPopupProps> = ({
  isOpen,
  onClose,
  type,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-background rounded-xl max-w-md w-full p-6 flex flex-col items-center">
        {type === "success" ? (
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
        )}
        <h3 className="text-xl font-space-mono text-secondary-white mb-4 text-center">
          {type === "success" ? "Application Submitted Successfully" : "Error"}
        </h3>
        <div className="text-secondary-white mb-6 text-center">
          {message.split("\n").map((line, index) => (
            <p key={index} className="mb-2">
              {line}
            </p>
          ))}
        </div>
        <button
          onClick={onClose}
          className={`${
            type === "success" ? "bg-main-orange" : "bg-red-500"
          } text-black px-8 py-2 rounded-full hover:opacity-90 transition-opacity font-space-grotesk`}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StatusPopup;
