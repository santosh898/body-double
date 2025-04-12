import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { notificationManager } from "../../lib/notifications";

interface RequestWithProfile {
  request: Doc<"pairingRequests">;
  profile: Doc<"profiles"> | null;
}

function RequestCard({ request, profile }: RequestWithProfile) {
  const imageUrl = useQuery(
    api.files.getImageUrl,
    profile?.imageUrl
      ? { storageId: profile.imageUrl as Id<"_storage"> }
      : "skip",
  );

  const respondToRequest = useMutation(api.pairing.respondToRequest);
  const navigate = useNavigate();

  const handleRespond = async (accept: boolean) => {
    try {
      await respondToRequest({ requestId: request._id, accept });
      toast.success(accept ? "Request accepted!" : "Request declined");
      if (accept) {
        void navigate("/room");
      }
    } catch (error) {
      toast.error("Failed to respond to request");
      console.error(error);
    }
  };

  return (
    <Card key={request._id} className="p-4">
      <div className="flex items-center gap-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={profile?.name}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{profile?.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            Working on: {request.currentActivity}
          </p>
          {request.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {request.tags.map((tag) => (
                <span key={tag} className="badge">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => void handleRespond(true)}>
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleRespond(false)}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function OutgoingRequestCard({ request, profile }: RequestWithProfile) {
  const imageUrl = useQuery(
    api.files.getImageUrl,
    profile?.imageUrl
      ? { storageId: profile.imageUrl as Id<"_storage"> }
      : "skip",
  );
  const cancelRequest = useMutation(api.pairing.cancelRequest);

  const handleCancel = async () => {
    try {
      await cancelRequest({ requestId: request._id });
      toast.success("Request cancelled");
    } catch (error) {
      toast.error("Failed to cancel request");
      console.error(error);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={profile?.name}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{profile?.name}</h3>
          <p className="text-sm text-gray-500">Waiting for response...</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => void handleCancel()}
          >
            Cancel Request
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function PairingRequests() {
  const incomingRequests = useQuery(api.pairing.getIncomingRequests);
  const outgoingRequest = useQuery(api.pairing.getOutgoingRequest);

  useEffect(() => {
    if (incomingRequests && incomingRequests.length > 0) {
      const latestRequest = incomingRequests[0];
      void notificationManager.showNotification({
        title: "New Pair Request",
        body: `${latestRequest.profile?.name} wants to pair with you!`,
        type: "pairRequest",
      });
    }
  }, [incomingRequests]);

  useEffect(() => {
    if (outgoingRequest?.request.status === "accepted") {
      void notificationManager.showNotification({
        title: "Pair Request Accepted",
        body: `${outgoingRequest.profile?.name} accepted your request!`,
        type: "pairAccepted",
      });
    }
  }, [outgoingRequest]);

  return (
    <div className="space-y-4 mb-8">
      {incomingRequests && incomingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Incoming Requests</h2>
          <div className="space-y-4">
            {incomingRequests.map(({ request, profile }) => (
              <RequestCard
                key={request._id}
                request={request}
                profile={profile}
              />
            ))}
          </div>
        </div>
      )}

      {outgoingRequest && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Outgoing Request</h2>
          <OutgoingRequestCard
            request={outgoingRequest.request}
            profile={outgoingRequest.profile}
          />
        </div>
      )}
    </div>
  );
}
