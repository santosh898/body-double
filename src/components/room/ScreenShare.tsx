import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Peer from "peerjs";
import { toast } from "sonner";

interface ScreenShareProps {
  currentUserId: string;
  partnerId: string;
}

export function ScreenShare({ currentUserId, partnerId }: ScreenShareProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [showMaximizeControl, setShowMaximizeControl] = useState(false);
  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const connectionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const updateStatus = useMutation(api.lobby.updateStatus);
  const partnerStatus = useQuery(api.lobby.getCurrentUserStatus, {
    userId: partnerId,
  });

  // Watch for partner's screen sharing status
  useEffect(() => {
    if (!isViewing && partnerStatus?.isScreenSharing === false) {
      cleanupVideo();
    }
  }, [partnerStatus?.isScreenSharing, isViewing]);

  const cleanupVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    setRemoteStream(null);
    setIsViewing(false);
    setIsMaximized(false);
  };

  const handleCall = useCallback((call: any) => {
    call.on("stream", (stream: MediaStream) => {
      setRemoteStream(stream);
      setIsViewing(true);
      connectionRef.current = call;
    });

    call.on("close", () => {
      cleanupVideo();
    });
  }, []);

  useEffect(() => {
    if (!peerRef.current) {
      const peerId = `screen-${currentUserId}-${Date.now()}`;
      peerRef.current = new Peer(peerId, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peerRef.current.on("open", (id: string) => {
        void updateStatus({
          screenShareId: id,
          isScreenSharing: false,
        });
      });

      peerRef.current.on("call", async (call: any) => {
        call.answer();
        handleCall(call);
      });
    }

    return () => {
      cleanupVideo();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [currentUserId, handleCall, updateStatus]);

  const startSharing = async () => {
    if (!partnerStatus?.screenShareId) {
      toast.error("Partner not ready for screen sharing");
      return;
    }

    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      stream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };

      streamRef.current = stream;
      const call = peerRef.current?.call(partnerStatus.screenShareId, stream);
      if (call) {
        setIsSharing(true);
        void updateStatus({ isScreenSharing: true });
      }
    } catch (error) {
      toast.error("Failed to start screen sharing");
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const stopSharing = () => {
    cleanupVideo();
    setIsSharing(false);
    void updateStatus({ isScreenSharing: false });
  };

  // Set video srcObject when remoteStream changes
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  console.log(isMaximized);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={isSharing ? stopSharing : startSharing}
        disabled={isConnecting}
        className={isSharing ? "bg-green-50" : ""}
      >
        {isConnecting ? (
          <span className="animate-pulse">Connecting...</span>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {isSharing ? "Stop Sharing" : "Share Screen"}
          </>
        )}
      </Button>

      {remoteStream && (
        <div
          className={`fixed ${
            isMaximized
              ? "inset-0 bg-black/90 flex items-center justify-center"
              : "bottom-4 right-4"
          } z-50 transition-all duration-200`}
          onClick={() => isMaximized && setIsMaximized(false)}
        >
          <div
            className="relative group"
            onMouseEnter={() => !isMaximized && setShowMaximizeControl(true)}
            onMouseLeave={() => !isMaximized && setShowMaximizeControl(false)}
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`${
                isMaximized
                  ? "max-w-[90vw] max-h-[90vh] rounded-lg"
                  : "w-60 rounded-lg shadow-lg"
              } cursor-pointer transition-all duration-200`}
            />
            {!isMaximized && showMaximizeControl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg transition-opacity">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2m8-20h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
