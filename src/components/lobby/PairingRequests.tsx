import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { useNavigate } from "react-router-dom";

export function PairingRequests() {
  const navigate = useNavigate();
  const incomingRequests = useQuery(api.pairing.getIncomingRequests) || [];
  const outgoingRequest = useQuery(api.pairing.getOutgoingRequest);
  const respondToRequest = useMutation(api.pairing.respondToRequest);
  const cancelRequest = useMutation(api.pairing.cancelRequest);

  const handleRespond = async (
    requestId: Id<"pairingRequests">,
    accept: boolean,
  ) => {
    try {
      await respondToRequest({ requestId, accept });
      toast.success(accept ? "Request accepted!" : "Request declined");
      if (accept) {
        navigate("/room");
      }
    } catch (error) {
      toast.error("Failed to respond to request");
      console.error(error);
    }
  };

  const handleCancel = async (requestId: Id<"pairingRequests">) => {
    try {
      await cancelRequest({ requestId });
      toast.success("Request cancelled");
    } catch (error) {
      toast.error("Failed to cancel request");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 mb-8">
      {incomingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Incoming Requests</h2>
          <div className="space-y-4">
            {incomingRequests.map(({ request, profile }) => (
              <Card key={request._id} className="p-4">
                <div className="flex items-center gap-4">
                  {profile?.imageUrl && (
                    <img
                      src={profile.imageUrl}
                      alt={profile.name}
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
                      <Button
                        size="sm"
                        onClick={() => void handleRespond(request._id, true)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handleRespond(request._id, false)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {outgoingRequest && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Outgoing Request</h2>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              {outgoingRequest.profile?.imageUrl && (
                <img
                  src={outgoingRequest.profile.imageUrl}
                  alt={outgoingRequest.profile.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">
                  {outgoingRequest.profile?.name}
                </h3>
                <p className="text-sm text-gray-500">Waiting for response...</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => void handleCancel(outgoingRequest.request._id)}
                >
                  Cancel Request
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
