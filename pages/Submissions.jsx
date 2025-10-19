
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Submissions() {
  const [formData, setFormData] = useState({
    role: "journalist",
    name: "",
    email: "",
    instagram: "",
    website: "",
    brandsAndTalent: "",
    subjectTitle: "",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";
      return isImage || isPDF;
    });

    if (files.length + validFiles.length > 3) {
      setError("Maximum 3 files allowed");
      return;
    }

    setFiles([...files, ...validFiles.slice(0, 3 - files.length)]);
    setError("");
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");

    try {
      // Upload files
      const fileUrls = [];
      for (const file of files) {
        // FormData is not used for base44.integrations.Core.UploadFile in this context if it expects a File object directly.
        // Assuming base44.integrations.Core.UploadFile expects a file object in its 'file' parameter.
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrls.push({ name: file.name, url: file_url });
      }

      // Send email
      const emailBody = `
New Submission for Éthique Magazine

Role: ${formData.role}
Name: ${formData.name}
Email: ${formData.email}
Instagram: ${formData.instagram}
Website: ${formData.website}

Subject: ${formData.subjectTitle}

Brands & Talent Worked With:
${formData.brandsAndTalent}

Attached Files:
${fileUrls.map(f => `${f.name}: ${f.url}`).join("\n")}
      `;

      await base44.integrations.Core.SendEmail({
        to: "media@one30m.com",
        subject: `New Submission: ${formData.role} - ${formData.name}`,
        body: emailBody,
      });

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
          <h2 className="text-3xl font-light mb-4">Submission Received</h2>
          <p className="text-gray-400 mb-8">
            Thank you for your submission. Our team will review your work within 72 hours
            and get back to you via email.
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-none"
            style={{ letterSpacing: '1px' }}
          >
            Return to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-6 pb-40">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <style>{`
            @keyframes illuminate {
              0%, 100% {
                box-shadow: 
                  0 0 20px rgba(255, 255, 255, 0.4),
                  0 0 40px rgba(255, 255, 255, 0.3),
                  0 0 60px rgba(255, 255, 255, 0.2),
                  0 8px 16px rgba(0, 0, 0, 0.3);
              }
              50% {
                box-shadow: 
                  0 0 30px rgba(255, 255, 255, 0.6),
                  0 0 60px rgba(255, 255, 255, 0.4),
                  0 0 90px rgba(255, 255, 255, 0.3),
                  0 12px 24px rgba(0, 0, 0, 0.4);
              }
            }
            
            .illuminate-button {
              animation: illuminate 3s ease-in-out infinite;
              transform: perspective(1000px) translateZ(0);
              transition: all 0.3s ease;
            }
            
            .illuminate-button:hover {
              transform: perspective(1000px) translateZ(20px) scale(1.05);
              box-shadow: 
                0 0 40px rgba(255, 255, 255, 0.8),
                0 0 80px rgba(255, 255, 255, 0.6),
                0 0 120px rgba(255, 255, 255, 0.4),
                0 16px 32px rgba(0, 0, 0, 0.5);
            }
          `}</style>

          <h1 className="text-5xl md:text-6xl font-light mb-4">Submissions</h1>
          <p className="text-xl text-gray-400 mb-12">
            Join the Éthique community. Share your work with us.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm uppercase tracking-wider text-gray-400">I am a</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {["journalist", "photographer", "stylist", "other"].map((role) => (
                  <div key={role} className="relative">
                    <RadioGroupItem
                      value={role}
                      id={role}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={role}
                      className="flex items-center justify-center px-6 py-4 border border-white/20 cursor-pointer hover:border-white/40 transition-colors peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/5 capitalize"
                    >
                      {role}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                name="name"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />

              <Input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />

              <Input
                name="instagram"
                placeholder="Instagram Handle"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />

              <Input
                name="website"
                type="url"
                placeholder="Website URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <Input
              name="subjectTitle"
              required
              placeholder="Subject Title"
              value={formData.subjectTitle}
              onChange={(e) => setFormData({ ...formData, subjectTitle: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />

            <Textarea
              name="brandsAndTalent"
              rows={5}
              placeholder="Brands & Talent Worked With"
              value={formData.brandsAndTalent}
              onChange={(e) => setFormData({ ...formData, brandsAndTalent: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
            />

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-sm uppercase tracking-wider text-gray-400">
                Upload Files (Max 3 images or 1 PDF)
              </Label>
              <div className="border-2 border-dashed border-white/20 hover:border-white/40 transition-colors p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto mb-4 text-gray-500" />
                  <p className="text-sm text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </label>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2 mt-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white/5 p-3 border border-white/10"
                    >
                      <span className="text-sm text-gray-300 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={uploading}
              className="illuminate-button w-full bg-white text-black hover:bg-white py-6 text-sm uppercase transition-all duration-300"
              style={{ borderRadius: '0px', letterSpacing: '1px' }}
            >
              {uploading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
