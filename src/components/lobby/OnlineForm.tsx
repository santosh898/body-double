import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";

interface OnlineFormProps {
  initialActivity?: string;
  initialTags?: string[];
  onSubmit: (data: { activity: string; tags: string[] }) => Promise<unknown>;
}

export function OnlineForm({
  initialActivity = "",
  initialTags = [],
  onSubmit,
}: OnlineFormProps) {
  const [activity, setActivity] = useState(initialActivity);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    if (!tagInput.trim()) {
      return;
    }

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
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activity.trim()) {
      return;
    }
    void onSubmit({ activity, tags });
  };

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Go Online</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}
