"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ref, uploadBytes } from "firebase/storage";

import { auth, storage } from "../../lib/firebase/client";

const uploadSchema = z.object({
  asOnDate: z.string().min(1, "As-on date is required"),
  datasetType: z.enum(["STATE", "UNION", "MIXED"]),
  notes: z.string().optional(),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required")
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema)
  });

  const onSubmit = async (data: UploadFormData) => {
    const file = data.file[0];
    if (!file) return;

    const user = auth.currentUser;
    const storageRef = ref(storage, `datasets/${Date.now()}-${file.name}`);

    await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        asOnDate: data.asOnDate,
        datasetType: data.datasetType,
        notes: data.notes ?? "",
        uploadedBy: user?.email ?? "unknown"
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upload Dataset</h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload DOCX or XLSX audit report datasets. Files are stored securely in Firebase
          Storage and parsed by Cloud Functions.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            As-on date
            <input
              type="text"
              placeholder="30.06.2025 / July 2025"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register("asOnDate")}
            />
            {errors.asOnDate ? (
              <span className="text-xs text-red-600">{errors.asOnDate.message}</span>
            ) : null}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Dataset type
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
              {...register("datasetType")}
            >
              <option value="STATE">STATE</option>
              <option value="UNION">UNION</option>
              <option value="MIXED">MIXED</option>
            </select>
            {errors.datasetType ? (
              <span className="text-xs text-red-600">{errors.datasetType.message}</span>
            ) : null}
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Notes (optional)
          <textarea
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            rows={3}
            {...register("notes")}
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Dataset file
          <input type="file" className="mt-2 w-full" accept=".docx,.xlsx" {...register("file")} />
          {errors.file ? <span className="text-xs text-red-600">{errors.file.message}</span> : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {isSubmitting ? "Uploading..." : "Upload dataset"}
        </button>
      </form>
    </div>
  );
}
