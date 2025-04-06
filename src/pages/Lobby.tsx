import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Doc } from "../../convex/_generated/dataModel";

export default function Lobby() {
  const navigate = useNavigate();
  const { isAuthenticated } = useConvexAuth();
  const [activity, setActivity] = useState("");

  const updateStatus = useMutation(api.lobby.updateStatus);
  const ping = useMutation(api.lobby.ping);
  const onlineUsers = useQuery(api.lobby.getOnlineUsers) || [];

  // Set online status when entering lobby
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    void updateStatus({ isOnline: true });

    // Ping every 10 seconds to stay online
    const interval = setInterval(() => {
      void ping();
    }, 10000);

    // Set offline when leaving
    return () => {
      clearInterval(interval);
      void updateStatus({ isOnline: false });
    };
  }, [isAuthenticated, navigate, updateStatus, ping]);

  const handleActivitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void updateStatus({ isOnline: true, currentActivity: activity });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Body Double Lobby</h1>

      {/* Current activity form */}
      <form onSubmit={handleActivitySubmit} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            value={activity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setActivity(e.target.value)
            }
            placeholder="What are you working on?"
            className="flex-1"
          />
          <Button type="submit">Update Activity</Button>
        </div>
      </form>

      {/* Online users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {onlineUsers.map(
          (user: {
            status: Doc<"userStatus">;
            profile: Doc<"profiles"> | null;
          }) => {
            // Skip users without profiles
            if (!user.profile) return null;

            const profile = user.profile; // Create a stable reference for TypeScript
            const status = user.status;

            return (
              <Card key={status._id} className="p-4">
                <div className="flex items-center gap-4">
                  {profile.imageUrl && (
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{profile.name}</h3>
                    {status.currentActivity && (
                      <p className="text-sm text-gray-600">
                        Working on: {status.currentActivity}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-gray-500 mt-1">
                        {profile.bio}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        // TODO: Implement pairing logic
                        console.log("Pair with", profile.name);
                      }}
                    >
                      Pair Up
                    </Button>
                  </div>
                </div>
              </Card>
            );
          },
        )}
      </div>

      {onlineUsers.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No one else is online right now. Stay here and others will see you
          when they join!
        </p>
      )}
    </div>
  );
}
