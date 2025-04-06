import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Peer from "peerjs";
import { toast } from "sonner";

interface AudioChatProps {
  currentUserId: string;
  partnerId: string;
  isHost?: boolean;
}

export function AudioChat({ currentUserId, partnerId }: AudioChatProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const connectionRef = useRef<any>(null);

  const updateStatus = useMutation(api.lobby.updateStatus);
  const partnerStatus = useQuery(api.lobby.getCurrentUserStatus, {
    userId: partnerId,
  });

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
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;
          call.answer(stream);
          handleCall(call);
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

  const handleCall = (call: any) => {
    call.on("stream", (remoteStream: MediaStream) => {
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play().catch(console.error);
      setIsConnected(true);
      connectionRef.current = call;
    });

    call.on("close", () => {
      setIsConnected(false);
      setIsAudioEnabled(false);
    });
  };

  const startCall = async () => {
    if (!partnerStatus?.rtcPeerId) {
      toast.error("Partner not ready for audio chat");
      return;
    }

    try {
      setIsConnecting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const call = peerRef.current?.call(partnerStatus.rtcPeerId, stream);
      if (call) {
        handleCall(call);
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
    void updateStatus({ isAudioEnabled: false });
  };

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
      void updateStatus({ isAudioEnabled: audioTrack.enabled });
    }
  };

  const handleStartCall = () => {
    void startCall();
  };

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartCall}
          disabled={isConnecting || !partnerStatus?.rtcPeerId}
        >
          {isConnecting ? (
            <>
              <span className="animate-pulse">Connecting...</span>
            </>
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
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m-2.828 9.9a9 9 0 010-12.728"
                />
              </svg>
              Start Audio Call
            </>
          )}
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                Mute
              </>
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
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
                Unmute
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={endCall}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
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
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z"
              />
            </svg>
            End Call
          </Button>
        </>
      )}
    </div>
  );
}
