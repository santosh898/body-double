import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Doc } from "../../convex/_generated/dataModel";
import { LoadingSpinner } from "../components/LoadingSpinner";
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
  const [tagInput, setTagInput] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Update state when currentStatus changes
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
    if (!isOnline) return;

    const interval = setInterval(() => {
      void ping();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [isOnline, ping]);

  const handleGoOnline = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activity.trim()) return;

    try {
      await updateStatus({
        isOnline: true,
        currentActivity: activity,
        tags: tags,
      });
      setIsOnline(true);
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
      setActivity("");
      setTags([]);
      toast.success("You're now offline.");
    } catch (error) {
      toast.error("Failed to go offline. Please try again.");
      console.error(error);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const newTag = tagInput.toLowerCase().trim();
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput("");
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    if (isOnline) {
      void updateStatus({
        isOnline: true,
        currentActivity: activity,
        tags: newTags,
      });
    }
  };

  const filteredUsers = filterTag
    ? onlineUsers.filter((user) => user.status.tags?.includes(filterTag))
    : onlineUsers;

  // Get all unique tags from online users
  const allTags = Array.from(
    new Set(onlineUsers.flatMap((user) => user.status.tags || [])),
  );

  return (
    <div className="container mx-auto py-8">
      {currentStatus === undefined ? (
        <Card className="p-6 mb-8 flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Loading your status...</span>
        </Card>
      ) : !isOnline ? (
        // Go Online Form
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Go Online</h2>
          <form onSubmit={(e) => void handleGoOnline(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                What are you working on?
              </label>
              <textarea
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Describe your current task or project..."
                className="w-full h-24 p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Add relevant tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add a tag (e.g., coding, writing, design)"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              Go Online
            </Button>
          </form>
        </Card>
      ) : (
        // Online Status
        <Card className="p-6 mb-8 bg-green-50 dark:bg-green-900/20">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">You are Online</h2>
              <p className="text-sm mb-2">Working on: {activity}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button onClick={() => void handleGoOffline()} variant="outline">
              Go Offline
            </Button>
          </div>
        </Card>
      )}

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Filter by tag:</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-2 py-1 rounded-md text-sm ${
                  filterTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Online users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map(
          (user: {
            status: Doc<"userStatus">;
            profile: Doc<"profiles"> | null;
          }) => {
            if (!user.profile) return null;

            const profile = user.profile;
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
                  <div className="flex-1">
                    <h3 className="font-semibold">{profile.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {status.currentActivity}
                    </p>
                    {status.tags && status.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {status.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
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

      {filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          {filterTag
            ? `No one online matching the tag "${filterTag}"`
            : "No one else is online right now. "}
        </p>
      )}
    </div>
  );
}
