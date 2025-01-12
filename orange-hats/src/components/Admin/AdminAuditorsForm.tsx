import React, { useState } from "react";
import { Auditor } from "@prisma/client";

interface AdminAuditorFormProps {
  initialData?: Partial<Auditor>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const AdminAuditorForm: React.FC<AdminAuditorFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    team: initialData?.team || "",
    proofOfWork: initialData?.proofOfWork || [""],
    contact: initialData?.contact || "",
    websiteUrl: initialData?.websiteUrl || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProofOfWorkChange = (index: number, value: string) => {
    const newProofOfWork = [...formData.proofOfWork];
    newProofOfWork[index] = value;
    setFormData((prev) => ({ ...prev, proofOfWork: newProofOfWork }));
  };

  const addProofOfWork = () => {
    setFormData((prev) => ({
      ...prev,
      proofOfWork: [...prev.proofOfWork, ""],
    }));
  };

  const removeProofOfWork = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      proofOfWork: prev.proofOfWork.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 h-[400px] overflow-y-scroll"
    >
      {" "}
      <div>
        <label htmlFor="name" className="block text-secondary-white mb-2">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>
      <div>
        <label htmlFor="team" className="block text-secondary-white mb-2">
          Team
        </label>
        <input
          id="team"
          name="team"
          type="text"
          value={formData.team}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>
      <div>
        <label className="block text-secondary-white mb-2">Proof of Work</label>
        {formData.proofOfWork.map((work, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={work}
              onChange={(e) => handleProofOfWorkChange(index, e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
            />
            <button
              type="button"
              onClick={() => removeProofOfWork(index)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addProofOfWork}
          className="mt-2 px-4 py-2 bg-main-orange text-black rounded-lg hover:opacity-90 transition-opacity"
        >
          Add Proof of Work
        </button>
      </div>
      <div>
        <label htmlFor="contact" className="block text-secondary-white mb-2">
          Contact
        </label>
        <input
          id="contact"
          name="contact"
          type="text"
          required
          value={formData.contact}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>
      <div>
        <label htmlFor="websiteUrl" className="block text-secondary-white mb-2">
          Website URL
        </label>
        <input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          value={formData.websiteUrl}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-background border border-main-dark-grey rounded-lg text-secondary-white focus:outline-none focus:border-main-orange"
        />
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-main-orange text-black rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default AdminAuditorForm;
