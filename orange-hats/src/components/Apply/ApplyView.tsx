import React, { useState } from "react";
import Menu from "@/components/Menu/Menu";
import { trpc } from "../../../utils/trpc";
import StatusPopup from "./StatusPopUp";
import { useAtom } from "jotai";
import { selectedTypeAtom } from "@/atoms";

const ApplyView = () => {
  const [selectedType, setSelectedType] = useAtom(selectedTypeAtom);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const formatValidationErrors = (error: any) => {
    try {
      const errorArray =
        typeof error.message === "string"
          ? JSON.parse(error.message)
          : error.message;

      if (!Array.isArray(errorArray)) {
        return "An error occurred with your submission. Please try again.";
      }

      const formattedErrors = errorArray.map((err: any) => {
        switch (err.validation) {
          case "email":
            return "Please enter a valid email address";
          case "url":
            const fieldName = err.path[0]
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()
              .replace(/^\w/, (c: string) => c.toUpperCase());
            return `${fieldName} must be a valid URL (include http:// or https://)`;
          default:
            return err.message;
        }
      });

      return [...new Set(formattedErrors)].join("\n");
    } catch (e) {
      return "An error occurred with your submission. Please check your inputs and try again.";
    }
  };

  const [auditForm, setAuditForm] = useState({
    email: "",
    name: "",
    team: "",
    landingPageUrl: "",
    githubUrl: "",
    twitterUrl: "",
    contractCount: 0,
    hasFundraised: false,
    has100TestCoverage: false,
    hasAuditHash: false,
    isNewLaunch: false,
  });

  const [auditorForm, setAuditorForm] = useState({
    email: "",
    name: "",
    githubUrl: "",
    applicationUrl: "",
    previousAudits: [""],
    yearsInClarity: 0,
    yearsInSecurity: 0,
    referral: "",
  });

  const [grantForm, setGrantForm] = useState({
    name: "",
    email: "",
    landingPageUrl: "",
    isLive: false,
    githubUrl: "",
    twitterUrl: "",
    communityImpact: "",
    securityImprovement: "",
    canLaunchWithoutGrant: false,
    requestedAmount: 0,
    timeLineProposal: "",
    teamSize: 1,
  });

  const auditMutation = trpc.applications.submitAuditApplication.useMutation({
    onSuccess: () => {
      setErrorMessage("");
      setShowSuccessPopup(true);
      setAuditForm({
        email: "",
        name: "",
        team: "",
        landingPageUrl: "",
        githubUrl: "",
        twitterUrl: "",
        contractCount: 0,
        hasFundraised: false,
        has100TestCoverage: false,
        hasAuditHash: false,
        isNewLaunch: false,
      });
    },
    onError: (error) => {
      const formattedError = formatValidationErrors(error);
      setErrorMessage(formattedError);
      setShowSuccessPopup(true);
    },
  });

  const auditorMutation =
    trpc.applications.submitAuditorApplication.useMutation({
      onSuccess: () => {
        setErrorMessage("");
        setShowSuccessPopup(true);
        setAuditorForm({
          email: "",
          name: "",
          githubUrl: "",
          applicationUrl: "",
          previousAudits: [""],
          yearsInClarity: 0,
          yearsInSecurity: 0,
          referral: "",
        });
      },
      onError: (error) => {
        const formattedError = formatValidationErrors(error);
        setErrorMessage(formattedError);
        setShowSuccessPopup(true);
      },
    });

  const grantMutation = trpc.applications.submitGrantApplication.useMutation({
    onSuccess: () => {
      setErrorMessage("");
      setShowSuccessPopup(true);
      setGrantForm({
        name: "",
        email: "",
        landingPageUrl: "",
        isLive: false,
        githubUrl: "",
        twitterUrl: "",
        communityImpact: "",
        securityImprovement: "",
        canLaunchWithoutGrant: false,
        requestedAmount: 0,
        timeLineProposal: "",
        teamSize: 1,
      });
    },
    onError: (error) => {
      const formattedError = formatValidationErrors(error);
      setErrorMessage(formattedError);
      setShowSuccessPopup(true);
    },
  });

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auditMutation.mutateAsync(auditForm);
    } catch (error) {}
  };

  const handleAuditorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auditorMutation.mutateAsync(auditorForm);
    } catch (error) {}
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await grantMutation.mutateAsync(grantForm);
    } catch (error) {}
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const renderAuditForm = () => {
    return (
      <form
        onSubmit={handleAuditSubmit}
        className="space-y-8 max-w-2xl mx-auto"
      >
        <div className="space-y-2">
          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Email
            </label>
            <textarea
              required
              value={auditForm.email}
              onChange={(e) => {
                setAuditForm((prev) => ({ ...prev, email: e.target.value }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Name
            </label>
            <textarea
              required
              value={auditForm.name}
              onChange={(e) => {
                setAuditForm((prev) => ({ ...prev, name: e.target.value }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Team
            </label>
            <textarea
              required
              value={auditForm.team}
              onChange={(e) => {
                setAuditForm((prev) => ({ ...prev, team: e.target.value }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Landing Page URL
            </label>
            <textarea
              value={auditForm.landingPageUrl}
              onChange={(e) => {
                setAuditForm((prev) => ({
                  ...prev,
                  landingPageUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              GitHub URL
            </label>
            <textarea
              required
              value={auditForm.githubUrl}
              onChange={(e) => {
                setAuditForm((prev) => ({
                  ...prev,
                  githubUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Twitter URL
            </label>
            <textarea
              value={auditForm.twitterUrl}
              onChange={(e) => {
                setAuditForm((prev) => ({
                  ...prev,
                  twitterUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Number of Contracts
            </label>
            <textarea
              required
              value={auditForm.contractCount}
              onChange={(e) => {
                setAuditForm((prev) => ({
                  ...prev,
                  contractCount: parseInt(e.target.value) || 0,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 mt-8">
          <label className="block text-secondary-white mb-4 text-lg font-space-grotesk">
            Additional Information
          </label>
          <div className="space-y-4 w-full max-w-md">
            <div className="flex justify-center items-center space-x-2">
              <input
                type="checkbox"
                checked={auditForm.hasFundraised}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    hasFundraised: e.target.checked,
                  }))
                }
                className="form-checkbox text-main-orange border-2 border-secondary-white w-5 h-5 rounded checked:bg-main-orange checked:border-main-orange focus:ring-main-orange focus:ring-2"
              />
              <span className="text-secondary-white">
                Has the Protocol Fundraised?
              </span>
            </div>

            <div className="flex justify-center items-center space-x-2">
              <input
                type="checkbox"
                checked={auditForm.has100TestCoverage}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    has100TestCoverage: e.target.checked,
                  }))
                }
                className="form-checkbox text-main-orange border-2 border-secondary-white w-5 h-5 rounded checked:bg-main-orange checked:border-main-orange focus:ring-main-orange focus:ring-2"
              />
              <span className="text-secondary-white">
                Does the Protocol have 100% Test Coverage?
              </span>
            </div>

            <div className="flex justify-center items-center space-x-2">
              <input
                type="checkbox"
                checked={auditForm.hasAuditHash}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    hasAuditHash: e.target.checked,
                  }))
                }
                className="form-checkbox text-main-orange border-2 border-secondary-white w-5 h-5 rounded checked:bg-main-orange checked:border-main-orange focus:ring-main-orange focus:ring-2"
              />
              <span className="text-secondary-white">
                Does the Protocol have a Previous Audit Hash?
              </span>
            </div>

            <div className="flex justify-center items-center space-x-2">
              <input
                type="checkbox"
                checked={auditForm.isNewLaunch}
                onChange={(e) =>
                  setAuditForm((prev) => ({
                    ...prev,
                    isNewLaunch: e.target.checked,
                  }))
                }
                className="form-checkbox text-main-orange border-2 border-secondary-white w-5 h-5 rounded checked:bg-main-orange checked:border-main-orange focus:ring-main-orange focus:ring-2"
              />
              <span className="text-secondary-white">
                Is the Protocol a New Launch?
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={auditMutation.isLoading}
          className="w-full bg-main-orange text-black font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 mt-8"
        >
          {auditMutation.isLoading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    );
  };

  const renderAuditorForm = () => {
    return (
      <form
        onSubmit={handleAuditorSubmit}
        className="space-y-8 max-w-2xl mx-auto"
      >
        <div className="space-y-2">
          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Email
            </label>
            <textarea
              required
              value={auditorForm.email}
              onChange={(e) => {
                setAuditorForm((prev) => ({ ...prev, email: e.target.value }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Name
            </label>
            <textarea
              required
              value={auditorForm.name}
              onChange={(e) => {
                setAuditorForm((prev) => ({ ...prev, name: e.target.value }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              GitHub URL
            </label>
            <textarea
              required
              value={auditorForm.githubUrl}
              onChange={(e) => {
                setAuditorForm((prev) => ({
                  ...prev,
                  githubUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Application URL
            </label>
            <textarea
              required
              value={auditorForm.applicationUrl}
              onChange={(e) => {
                setAuditorForm((prev) => ({
                  ...prev,
                  applicationUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Previous Audits
            </label>
            {auditorForm.previousAudits.map((audit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <textarea
                  value={audit}
                  onChange={(e) => {
                    const newAudits = [...auditorForm.previousAudits];
                    newAudits[index] = e.target.value;
                    setAuditorForm((prev) => ({
                      ...prev,
                      previousAudits: newAudits,
                    }));
                    handleTextareaResize(e);
                  }}
                  onInput={handleTextareaResize}
                  className="flex-1 px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
                  rows={1}
                />
                {index === auditorForm.previousAudits.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setAuditorForm((prev) => ({
                        ...prev,
                        previousAudits: [...prev.previousAudits, ""],
                      }))
                    }
                    className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
                Years in Clarity
              </label>
              <textarea
                required
                value={auditorForm.yearsInClarity}
                onChange={(e) => {
                  setAuditorForm((prev) => ({
                    ...prev,
                    yearsInClarity: parseInt(e.target.value) || 0,
                  }));
                  handleTextareaResize(e);
                }}
                onInput={handleTextareaResize}
                className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
                Years in Security
              </label>
              <textarea
                required
                value={auditorForm.yearsInSecurity}
                onChange={(e) => {
                  setAuditorForm((prev) => ({
                    ...prev,
                    yearsInSecurity: parseInt(e.target.value) || 0,
                  }));
                  handleTextareaResize(e);
                }}
                onInput={handleTextareaResize}
                className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
                rows={1}
              />
            </div>
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Referral (Optional)
            </label>
            <textarea
              value={auditorForm.referral}
              onChange={(e) => {
                setAuditorForm((prev) => ({
                  ...prev,
                  referral: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={auditorMutation.isLoading}
          className="w-full bg-main-orange text-black font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 mt-8"
        >
          {auditorMutation.isLoading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    );
  };

  const renderGrantForm = () => {
    return (
      <form
        onSubmit={handleGrantSubmit}
        className="space-y-8 max-w-2xl mx-auto"
      >
        <div className="space-y-2">
          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Name
            </label>
            <textarea
              required
              value={grantForm.name}
              onChange={(e) => {
                setGrantForm((prev) => ({ ...prev, name: e.target.value }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Email
            </label>
            <textarea
              required
              value={grantForm.email}
              onChange={(e) => {
                setGrantForm((prev) => ({ ...prev, email: e.target.value }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Landing Page URL
            </label>
            <textarea
              value={grantForm.landingPageUrl}
              onChange={(e) => {
                setGrantForm((prev) => ({
                  ...prev,
                  landingPageUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              GitHub URL
            </label>
            <textarea
              value={grantForm.githubUrl}
              onChange={(e) => {
                setGrantForm((prev) => ({
                  ...prev,
                  githubUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Twitter URL
            </label>
            <textarea
              value={grantForm.twitterUrl}
              onChange={(e) => {
                setGrantForm((prev) => ({
                  ...prev,
                  twitterUrl: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Community Impact
            </label>
            <textarea
              required
              value={grantForm.communityImpact}
              onChange={(e) => {
                setGrantForm((prev) => ({
                  ...prev,
                  communityImpact: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Security Improvement
            </label>
            <textarea
              required
              value={grantForm.securityImprovement}
              onChange={(e) => {
                setGrantForm((prev) => ({
                  ...prev,
                  securityImprovement: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div>
            <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
              Timeline Proposal
            </label>
            <textarea
              required
              value={grantForm.timeLineProposal}
              onChange={(e) => {
                setGrantForm((prev) => ({
                  ...prev,
                  timeLineProposal: e.target.value,
                }));
                handleTextareaResize(e);
              }}
              onInput={handleTextareaResize}
              className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
              rows={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
                Requested Amount
              </label>
              <textarea
                required
                value={grantForm.requestedAmount}
                onChange={(e) => {
                  setGrantForm((prev) => ({
                    ...prev,
                    requestedAmount: parseFloat(e.target.value) || 0,
                  }));
                  handleTextareaResize(e);
                }}
                onInput={handleTextareaResize}
                className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
                rows={1}
              />
            </div>
            <div>
              <label className="block text-secondary-white mb-2 text-lg font-space-grotesk">
                Team Size
              </label>
              <textarea
                required
                value={grantForm.teamSize}
                onChange={(e) => {
                  setGrantForm((prev) => ({
                    ...prev,
                    teamSize: parseInt(e.target.value) || 1,
                  }));
                  handleTextareaResize(e);
                }}
                onInput={handleTextareaResize}
                className="w-full px-6 py-4 bg-background border-2 border-secondary-white rounded-full text-secondary-white min-h-[48px] overflow-hidden resize-none"
                rows={1}
              />
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4 mt-8">
            <label className="block text-secondary-white mb-4 text-lg font-space-grotesk">
              Additional Information
            </label>
            <div className="space-y-4 w-full max-w-md">
              <div className="flex justify-center items-center space-x-2">
                <input
                  type="checkbox"
                  checked={grantForm.isLive}
                  onChange={(e) =>
                    setGrantForm((prev) => ({
                      ...prev,
                      isLive: e.target.checked,
                    }))
                  }
                  className="form-checkbox text-main-orange border-2 border-secondary-white w-5 h-5 rounded checked:bg-main-orange checked:border-main-orange focus:ring-main-orange focus:ring-2"
                />
                <span className="text-secondary-white">
                  Is the Protocol Live?
                </span>
              </div>

              <div className="flex justify-center items-center space-x-2">
                <input
                  type="checkbox"
                  checked={grantForm.canLaunchWithoutGrant}
                  onChange={(e) =>
                    setGrantForm((prev) => ({
                      ...prev,
                      canLaunchWithoutGrant: e.target.checked,
                    }))
                  }
                  className="form-checkbox text-main-orange border-2 border-secondary-white w-5 h-5 rounded checked:bg-main-orange checked:border-main-orange focus:ring-main-orange focus:ring-2"
                />
                <span className="text-secondary-white">
                  Can the Protocol Launch Without this Grant?
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={grantMutation.isLoading}
          className="w-full bg-main-orange text-black font-bold py-3 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 mt-8"
        >
          {grantMutation.isLoading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    );
  };

  const getFormTitle = () => {
    switch (selectedType) {
      case "audit":
        return {
          title: "Apply for an Audit",
          description:
            "Get your protocol audited by our experienced team of security researchers.",
          subDescription:
            "Complete the form below to apply for a sponsored audit.",
        };
      case "auditor":
        return {
          title: "Apply to Audit",
          description:
            "Join our network of security researchers and help secure the ecosystem.",
          subDescription: "Share your experience and expertise with us.",
        };
      case "grant":
        return {
          title: "Apply for a Grant",
          description:
            "Get funding for your security-focused project or research.",
          subDescription:
            "Tell us about your project and how it will improve ecosystem security.",
        };
    }
  };

  const renderForm = () => {
    switch (selectedType) {
      case "audit":
        return renderAuditForm();
      case "auditor":
        return renderAuditorForm();
      case "grant":
        return renderGrantForm();
    }
  };

  const formInfo = getFormTitle();

  return (
    <div className="min-h-screen bg-background">
      <Menu />

      <main className="max-w-7xl mx-auto px-6 pt-8">
        <h1 className="text-[30px] md:text-[48px] font-space-mono text-secondary-white mb-4 text-center">
          Apply to OrangeHats
        </h1>

        <p className="text-[18px] md:text-[32px] font-space-grotesk text-secondary-white mb-8 text-center">
          Join the ecosystem and help secure the future of Bitcoin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 items-center justify-center">
          <button
            onClick={() => setSelectedType("audit")}
            className={`w-full sm:w-[224px] h-[60px] ${
              selectedType === "audit"
                ? "bg-main-orange text-black"
                : "bg-main-dark-grey text-secondary-white"
            } text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity`}
          >
            Apply For Audit
          </button>
          <button
            onClick={() => setSelectedType("auditor")}
            className={`w-full sm:w-[224px] h-[60px] ${
              selectedType === "auditor"
                ? "bg-main-orange text-black"
                : "bg-main-dark-grey text-secondary-white"
            } text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity`}
          >
            Apply To Audit
          </button>
          <button
            onClick={() => setSelectedType("grant")}
            className={`w-full sm:w-[224px] h-[60px] ${
              selectedType === "grant"
                ? "bg-main-orange text-black"
                : "bg-main-dark-grey text-secondary-white"
            } text-[20px] font-bold rounded-[100px] hover:opacity-90 transition-opacity`}
          >
            Apply For Grant
          </button>
        </div>
        <div className="bg-main-dark-grey rounded-xl p-6 mb-12">
          <div className="mb-12 text-center">
            <h2 className="text-[24px] md:text-[36px] font-space-grotesk text-secondary-white mb-4">
              {formInfo.title}
            </h2>
            <p className="text-[16px] md:text-[20px] font-space-grotesk text-secondary-white mb-2">
              {formInfo.description}
            </p>
            <p className="text-[14px] md:text-[18px] font-space-grotesk text-secondary-white opacity-80">
              {formInfo.subDescription}
            </p>
          </div>
          {renderForm()}
        </div>
      </main>

      <StatusPopup
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        type={errorMessage ? "error" : "success"}
        message={errorMessage || "Application Submitted Successfully"}
      />
    </div>
  );
};

export default ApplyView;
