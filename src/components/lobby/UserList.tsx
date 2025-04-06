import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Doc } from "../../../convex/_generated/dataModel";

interface UserListProps {
  users: Array<{
    status: Doc<"userStatus">;
    profile: Doc<"profiles"> | null;
  }>;
  filterTag: string | null;
  onFilterTag: (tag: string | null) => void;
}

export function UserList({ users, filterTag, onFilterTag }: UserListProps) {
  if (!users.length) {
    return (
      <p className="text-center text-gray-500 mt-8">
        {filterTag
          ? `No one online matching the tag "${filterTag}"`
          : "No one else is online right now. Be the first to go online!"}
      </p>
    );
  }

  // Get all unique tags from online users
  const allTags = Array.from(
    new Set(users.flatMap((user) => user.status.tags || [])),
  );

  return (
    <>
      {allTags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Filter by tag:</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span
                className="badge"
                key={tag}
                onClick={() => onFilterTag(filterTag === tag ? null : tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          if (!user.profile) {
            return null;
          }

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
                        <span key={tag} className="badge">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {profile.bio && (
                    <p className="text-sm text-gray-500 mt-1">{profile.bio}</p>
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
        })}
      </div>
    </>
  );
}
