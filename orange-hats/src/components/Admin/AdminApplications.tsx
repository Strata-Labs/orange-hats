import React, { useState } from "react";
import { trpc } from "../../../utils/trpc";
import { toast } from "sonner";

type ApplicationType = "auditor" | "audit" | "grant";
type ApplicationStatus = "pending" | "approved" | "rejected";

const AdminApplications = () => {
  const [selectedType, setSelectedType] = useState<ApplicationType>("audit");
  const [selectedStatus, setSelectedStatus] =
    useState<ApplicationStatus>("pending");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{
    id: string;
    type: ApplicationType;
    newStatus: ApplicationStatus;
  } | null>(null);

  const utils = trpc.useContext();

  const { data: auditApplications, isLoading: isLoadingAudit } =
    trpc.applications.getAuditApplications.useQuery({ status: selectedStatus });
  const { data: auditorApplications, isLoading: isLoadingAuditor } =
    trpc.applications.getAuditorApplications.useQuery({
      status: selectedStatus,
    });
  const { data: grantApplications, isLoading: isLoadingGrant } =
    trpc.applications.getGrantApplications.useQuery({ status: selectedStatus });

  const updateStatusMutation =
    trpc.applications.updateApplicationStatus.useMutation({
      onSuccess: () => {
        utils.applications.getAuditApplications.invalidate();
        utils.applications.getAuditorApplications.invalidate();
        utils.applications.getGrantApplications.invalidate();
        toast.success("Application status updated successfully");
        setShowStatusDialog(false);
      },
      onError: (error) => {
        toast.error(`Failed to update status: ${error.message}`);
      },
    });

  const handleStatusChange = (
    id: string,
    type: ApplicationType,
    newStatus: ApplicationStatus
  ) => {
    updateStatusMutation.mutateAsync({
      type,
      id,
      status: newStatus,
    });
  };

  const renderApplications = (applications: any[], type: ApplicationType) => {
    if (!applications?.length) {
      return (
        <div className="text-center py-8 text-secondary-white">
          No {type} applications found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-background p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-space-grotesk text-secondary-white">
                  {app.name}
                </h3>
                <p className="text-secondary-white opacity-80">{app.email}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(app.id, type, "approved")}
                  className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  disabled={app.status === "approved"}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(app.id, type, "rejected")}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  disabled={app.status === "rejected"}
                >
                  Reject
                </button>
              </div>
            </div>

            {type === "auditor" && (
              <div className="space-y-2 text-secondary-white">
                <p>Years in Clarity: {app.yearsInClarity}</p>
                <p>Years in Security: {app.yearsInSecurity}</p>
                <p>Previous Audits: {app.previousAudits.join(", ")}</p>
                <p>
                  Github:{" "}
                  <a
                    href={app.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-main-orange hover:underline"
                  >
                    {app.githubUrl}
                  </a>
                </p>
              </div>
            )}

            {type === "audit" && (
              <div className="space-y-2 text-secondary-white">
                <p>Team: {app.team}</p>
                <p>Contract Count: {app.contractCount}</p>
                <p>Fundraised: {app.hasFundraised ? "Yes" : "No"}</p>
                <p>
                  100% Test Coverage: {app.has100TestCoverage ? "Yes" : "No"}
                </p>
                <p>Previous Audit Hash: {app.hasAuditHash ? "Yes" : "No"}</p>
                <p>New Launch: {app.isNewLaunch ? "Yes" : "No"}</p>
                <p>
                  Github:{" "}
                  <a
                    href={app.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-main-orange hover:underline"
                  >
                    {app.githubUrl}
                  </a>
                </p>
              </div>
            )}

            {type === "grant" && (
              <div className="space-y-2 text-secondary-white">
                <p>Requested Amount: ${app.requestedAmount}</p>
                <p>Team Size: {app.teamSize}</p>
                <p>Is Live: {app.isLive ? "Yes" : "No"}</p>
                <p>
                  Can Launch Without Grant:{" "}
                  {app.canLaunchWithoutGrant ? "Yes" : "No"}
                </p>
                <p>Community Impact: {app.communityImpact}</p>
                <p>Security Improvement: {app.securityImprovement}</p>
                <p>Timeline Proposal: {app.timeLineProposal}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelectedType("audit")}
          className={`px-4 py-2 rounded-full font-space-grotesk ${
            selectedType === "audit"
              ? "bg-main-orange text-black"
              : "bg-main-dark-grey text-secondary-white"
          }`}
        >
          Audit Applications
        </button>
        <button
          onClick={() => setSelectedType("auditor")}
          className={`px-4 py-2 rounded-full font-space-grotesk ${
            selectedType === "auditor"
              ? "bg-main-orange text-black"
              : "bg-main-dark-grey text-secondary-white"
          }`}
        >
          Auditor Applications
        </button>
        <button
          onClick={() => setSelectedType("grant")}
          className={`px-4 py-2 rounded-full font-space-grotesk ${
            selectedType === "grant"
              ? "bg-main-orange text-black"
              : "bg-main-dark-grey text-secondary-white"
          }`}
        >
          Grant Applications
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedStatus("pending")}
          className={`px-4 py-2 rounded-full ${
            selectedStatus === "pending"
              ? "bg-main-orange text-black"
              : "bg-main-dark-grey text-secondary-white"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setSelectedStatus("approved")}
          className={`px-4 py-2 rounded-full ${
            selectedStatus === "approved"
              ? "bg-main-orange text-black"
              : "bg-main-dark-grey text-secondary-white"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setSelectedStatus("rejected")}
          className={`px-4 py-2 rounded-full ${
            selectedStatus === "rejected"
              ? "bg-main-orange text-black"
              : "bg-main-dark-grey text-secondary-white"
          }`}
        >
          Rejected
        </button>
      </div>

      {selectedType === "audit" &&
        (isLoadingAudit ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          renderApplications(auditApplications || [], "audit")
        ))}
      {selectedType === "auditor" &&
        (isLoadingAuditor ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          renderApplications(auditorApplications || [], "auditor")
        ))}
      {selectedType === "grant" &&
        (isLoadingGrant ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          renderApplications(grantApplications || [], "grant")
        ))}
    </div>
  );
};

export default AdminApplications;
