import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { CallControl } from "./CallControl";
import { Id } from "../../../convex/_generated/dataModel";

interface ChatHeaderProps {
  partner: {
    name: string;
    imageUrl?: Id<"_storage">;
    userId: string;
  } | null;
  currentUserId: string;
  currentActivity?: string;
  onEndSession: () => void;
}

export function ChatHeader({
  partner,
  currentUserId,
  currentActivity,
  onEndSession,
}: ChatHeaderProps) {
  const imageUrl = useQuery(
    api.files.getImageUrl,
    partner?.imageUrl ? { storageId: partner.imageUrl } : "skip",
  );

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-muted text-muted-foreground text-xl font-semibold">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={partner?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{partner?.name?.charAt(0).toUpperCase() ?? "P"}</span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{partner?.name}</h2>
            {currentActivity && (
              <p className="text-sm text-muted-foreground">
                Working on: {currentActivity}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CallControl
            currentUserId={currentUserId}
            partnerId={partner?.userId ?? ""}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={onEndSession}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            End Session
          </Button>
        </div>
      </div>
    </Card>
  );
}
