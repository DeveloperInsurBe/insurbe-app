"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DocumentsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [files, setFiles] = useState<any[]>([]);

  const handleFileChange = async (e: any) => {
    const selectedFiles = Array.from(e.target.files);

    const convertedFiles = await Promise.all(
      selectedFiles.map(async (file: any) => {
        const base64 = await toBase64(file);
        return {
          name: file.name,
          base64,
        };
      })
    );

    setFiles(convertedFiles);
  };

  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleSubmit = async () => {
    try {
      await fetch(`/api/application/${id}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files }),
      });

      console.log("✅ Documents saved");

      router.push(`/application/${id}/signature`);
    } catch (err) {
      console.error("❌ Upload error", err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow space-y-4">
        <h1 className="text-xl font-bold">Upload Documents</h1>

        <input type="file" multiple onChange={handleFileChange} />

        {files.length > 0 && (
          <div className="text-sm text-gray-600">
            {files.length} file(s) selected
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}