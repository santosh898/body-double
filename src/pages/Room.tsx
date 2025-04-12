import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Card } from "../components/ui/card";
import { toast } from "sonner";
import { MessageList } from "../components/room/MessageList";
import { MessageInput } from "../components/room/MessageInput";
import { ChatHeader } from "../components/room/ChatHeader";

export default function Room() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();

  const currentStatus = useQuery(api.lobby.getCurrentUserStatus, {});
  const chatData = useQuery(api.chat.getMessages);
  const sendMessage = useMutation(api.chat.sendMessage);
  const endSession = useMutation(api.lobby.endSession);

  // Redirect if not authenticated or not in a session
  useEffect(() => {
    if (!isAuthenticated) {
      void navigate("/sign-in");
      return;
    }

    if (currentStatus && !currentStatus.inSession) {
      void navigate("/lobby");
      return;
    }
  }, [isAuthenticated, currentStatus, navigate]);

  const handleSendMessage = (content: string) => {
    void sendMessage({ content }).catch((error) => {
      toast.error("Failed to send message");
      console.error(error);
    });
  };

  const handleEndSession = () => {
    void endSession()
      .then(() => {
        toast.success("Session ended");
        void navigate("/lobby");
      })
      .catch((error) => {
        toast.error("Failed to end session");
        console.error(error);
      });
  };

  if (!chatData || !currentStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Loading chat...</span>
      </div>
    );
  }

  const { messages, currentUser, partner } = chatData;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <ChatHeader
        partner={partner}
        currentUserId={currentUser?.userId ?? ""}
        currentActivity={currentStatus.currentActivity}
        onEndSession={handleEndSession}
      />

      <Card className="p-4 mb-4 h-[60vh] flex flex-col">
        <MessageList
          messages={messages}
          currentUserId={currentUser?.userId}
          currentUserName={currentUser?.name}
          partnerName={partner?.name}
        />
        <MessageInput onSendMessage={handleSendMessage} />
      </Card>
    </div>
  );
}
