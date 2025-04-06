import { useState, useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function Profile() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.profiles.getProfile, {});
  const updateProfile = useMutation(api.profiles.updateProfile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const getImageUrl = useQuery(
    api.files.getImageUrl,
    profile?.imageUrl
      ? { storageId: profile.imageUrl as Id<"_storage"> }
      : "skip",
  );

  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [tags, setTags] = useState<string[]>(profile?.tags || []);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setTags(profile.tags || []);
    }
  }, [profile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadPromise = async () => {
      try {
        // Get a signed upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload the file directly to storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`);
        }

        // Get the storageId from the upload response
        const { storageId } = await result.json();

        // Update the profile with the new image URL
        await updateProfile({ imageUrl: storageId });
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Failed to upload image",
        );
      }
    };

    toast.promise(uploadPromise(), {
      loading: "Uploading image...",
      success: "Image uploaded successfully!",
      error: (err) => err.message,
    });
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    toast.promise(updateProfile({ name, bio, tags }), {
      loading: "Saving profile...",
      success: "Profile updated successfully!",
      error: "Failed to update profile",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen hero bg-base-200 px-4">
        <div className="hero-content w-full max-w-3xl p-0">
          <div className="card bg-base-100 shadow-xl w-full">
            <div className="card-body">
              <h2 className="card-title justify-center">Profile</h2>
              <p>Please sign in to view your profile.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero bg-base-200 px-4">
      <div className="hero-content w-full max-w-4xl p-0">
        <div className="card bg-base-100 shadow-xl w-full">
          <div className="card-body gap-6">
            <h2 className="card-title justify-center text-3xl">Profile</h2>

            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <div className="avatar">
                <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  {getImageUrl && (
                    <img
                      src={getImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void handleFileUpload(e)}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="btn btn-primary">
                Upload Image
              </label>
            </div>

            {/* Name Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Bio Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="textarea textarea-bordered w-full"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Tags Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Skills & Interests</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="join w-full">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  className="input input-bordered join-item flex-1"
                  placeholder="Add a skill or interest..."
                />
                <button
                  onClick={handleAddTag}
                  className="btn btn-primary join-item"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="card-actions justify-end">
              <button
                onClick={() => void handleSave()}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
