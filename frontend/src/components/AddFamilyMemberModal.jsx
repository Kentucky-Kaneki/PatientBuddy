import { useState } from "react";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AddFamilyMemberModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    relationship: "Child",
    dateOfBirth: "",
    gender: "Male",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onAdd(formData);
      setFormData({
        name: "",
        relationship: "Child",
        dateOfBirth: "",
        gender: "Male",
      });
      onClose();
    } catch (error) {
      console.error("Failed to add family member:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Add Family Member</h2>
              <p className="text-sm text-muted-foreground">Create a new family profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="w-full"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Relationship *
            </label>
            <select
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date of Birth
            </label>
            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFamilyMemberModal;