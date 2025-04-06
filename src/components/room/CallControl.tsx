import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Peer from "peerjs";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
} from "lucide-react";

interface CallControlProps {
  currentUserId: string;
  partnerId: string;
}

export function CallControl({ currentUserId, partnerId }: CallControlProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showMaximizeControl, setShowMaximizeControl] = useState(false);

  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const connectionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const updateStatus = useMutation(api.lobby.updateStatus);
  const partnerStatus = useQuery(api.lobby.getCurrentUserStatus, {
    userId: partnerId,
  });

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    // Initialize PeerJS with STUN servers
    if (!peerRef.current) {
      const peerId = `rtc-${currentUserId}-${Date.now()}`;
      peerRef.current = new Peer(peerId, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
        },
      });

      peerRef.current.on("open", (id: string) => {
        void updateStatus({
          rtcPeerId: id,
          isAudioEnabled: false,
        });
      });

      peerRef.current.on("error", () => {
        toast.error("Connection error. Please try again.");
        setIsConnecting(false);
        setIsConnected(false);
      });

      peerRef.current.on("disconnected", () => {
        toast.error("Connection lost. Attempting to reconnect...");
        peerRef.current?.reconnect();
      });

      // Handle incoming calls
      peerRef.current.on("call", async (call: any) => {
        try {
          // Check if the remote stream has video tracks to determine if it's a screen share
          call.on("stream", (remoteStream: MediaStream) => {
            if (remoteStream.getVideoTracks().length > 0) {
              // It's a screen share
              setRemoteStream(remoteStream);
            } else {
              // It's an audio call
              const audio = new Audio();
              audio.srcObject = remoteStream;
              audio.play().catch(console.error);
              setIsConnected(true);
              connectionRef.current = call;
            }
          });

          // Always answer with audio stream if we have one
          const stream =
            streamRef.current ||
            (await navigator.mediaDevices.getUserMedia({ audio: true }));
          streamRef.current = stream;
          call.answer(stream);
        } catch (error) {
          toast.error("Failed to access microphone");
          console.error(error);
        }
      });
    }

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      connectionRef.current?.close();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [currentUserId, updateStatus]);

  const startCall = async () => {
    if (!partnerStatus?.rtcPeerId) {
      toast.error("Partner not ready for call");
      return;
    }

    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const call = peerRef.current?.call(partnerStatus.rtcPeerId, stream);
      if (call) {
        call.on("stream", (remoteStream: MediaStream) => {
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.play().catch(console.error);
          setIsConnected(true);
          connectionRef.current = call;
        });
      }

      setIsAudioEnabled(true);
      void updateStatus({ isAudioEnabled: true });
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    connectionRef.current?.close();
    setIsConnected(false);
    setIsAudioEnabled(false);
    setIsScreenSharing(false);
    setRemoteStream(null);
    void updateStatus({ isAudioEnabled: false, isScreenSharing: false });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      void updateStatus({ isAudioEnabled: audioTrack.enabled });
    }
  };

  const toggleScreenShare = async () => {
    if (!isConnected) {
      toast.error("Start call before sharing screen");
      return;
    }

    if (isScreenSharing) {
      setIsScreenSharing(false);
      setRemoteStream(null);
      void updateStatus({ isScreenSharing: false });
      return;
    }

    if (!partnerStatus?.rtcPeerId) {
      toast.error("Partner not connected");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const call = peerRef.current?.call(partnerStatus.rtcPeerId, stream);
      if (call) {
        call.on("stream", (remoteStream: MediaStream) => {
          setRemoteStream(remoteStream);
        });

        setIsScreenSharing(true);
        void updateStatus({ isScreenSharing: true });

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setRemoteStream(null);
          void updateStatus({ isScreenSharing: false });
        };
      }
    } catch (error) {
      console.error("Failed to share screen:", error);
      toast.error("Failed to start screen sharing");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void startCall()}
          disabled={isConnecting || !partnerStatus?.rtcPeerId}
        >
          <Phone className="w-4 h-4 mr-2" />
          {isConnecting ? "Connecting..." : "Start Call"}
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            className={isAudioEnabled ? "bg-green-50" : "bg-red-50"}
          >
            {isAudioEnabled ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void toggleScreenShare()}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={endCall}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </>
      )}
      {remoteStream && (
        <div
          className={`fixed transition-all duration-300 ${
            isMaximized
              ? "inset-4 bg-black/50 flex items-center justify-center"
              : "bottom-4 right-4"
          }`}
          style={{ zIndex: 50 }}
          onMouseEnter={() => setShowMaximizeControl(true)}
          onMouseLeave={() => setShowMaximizeControl(false)}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`rounded-lg shadow-lg transition-all duration-300 ${
              isMaximized
                ? "max-w-[90vw] max-h-[90vh] w-auto h-auto"
                : "w-60 cursor-pointer"
            }`}
            onClick={() => setIsMaximized(!isMaximized)}
          />
          {showMaximizeControl && !isMaximized && (
            <div
              className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg cursor-pointer"
              onClick={() => setIsMaximized(true)}
            >
              <Monitor className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
