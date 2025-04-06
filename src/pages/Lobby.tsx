import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { OnlineForm } from "../components/lobby/OnlineForm";
import { OnlineStatus } from "../components/lobby/OnlineStatus";
import { UserList } from "../components/lobby/UserList";
import { PairingRequests } from "../components/lobby/PairingRequests";
import { toast } from "sonner";

export default function Lobby() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const currentStatus = useQuery(api.lobby.getCurrentUserStatus);
  const updateStatus = useMutation(api.lobby.updateStatus);
  const ping = useMutation(api.lobby.ping);
  const onlineUsers = useQuery(api.lobby.getOnlineUsers) || [];

  const [isOnline, setIsOnline] = useState(false);
  const [activity, setActivity] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Initialize state when currentStatus is available
  useEffect(() => {
    if (currentStatus) {
      setIsOnline(currentStatus.isOnline);
      setActivity(currentStatus.currentActivity ?? "");
      setTags(currentStatus.tags ?? []);
    }
  }, [currentStatus]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);

  // Ping server when online
  useEffect(() => {
    if (!isOnline) {
      return;
    }

    const interval = setInterval(() => {
      void ping();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [isOnline, ping, updateStatus]);

  const handleGoOnline = async (data: { activity: string; tags: string[] }) => {
    try {
      await updateStatus({
        isOnline: true,
        currentActivity: data.activity,
        tags: data.tags,
      });
      setIsOnline(true);
      setActivity(data.activity);
      setTags(data.tags);
      toast.success("You're now online and visible to others!");
    } catch (error) {
      toast.error("Failed to go online. Please try again.");
      console.error(error);
    }
  };

  const handleGoOffline = async () => {
    try {
      await updateStatus({ isOnline: false });
      setIsOnline(false);
      toast.success("You're now offline.");
    } catch (error) {
      toast.error("Failed to go offline. Please try again.");
      console.error(error);
    }
  };

  const filteredUsers = filterTag
    ? onlineUsers.filter((user) => user.status.tags?.includes(filterTag))
    : onlineUsers;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Body Double Lobby</h1>

      {currentStatus === undefined && (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
          <span className="ml-2">Loading your status...</span>
        </div>
      )}

      {currentStatus !== undefined && !isOnline && (
        <OnlineForm
          initialActivity={activity}
          initialTags={tags}
          onSubmit={handleGoOnline}
        />
      )}

      {currentStatus !== undefined && isOnline && (
        <OnlineStatus
          activity={activity}
          tags={tags}
          onGoOffline={handleGoOffline}
        />
      )}

      <PairingRequests />

      <UserList
        users={filteredUsers}
        filterTag={filterTag}
        onFilterTag={setFilterTag}
        currentActivity={activity}
        currentTags={tags}
      />
    </div>
  );
}
