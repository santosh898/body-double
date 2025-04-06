import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface OnlineStatusProps {
  activity: string;
  tags: string[];
  onGoOffline: () => Promise<unknown>;
}

export function OnlineStatus({
  activity,
  tags,
  onGoOffline,
}: OnlineStatusProps) {
  return (
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
        <Button onClick={() => void onGoOffline()} variant="outline">
          Go Offline
        </Button>
      </div>
    </Card>
  );
}
