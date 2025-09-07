"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  schoolSchema,
  SchoolSchema,
} from "@/lib/formValidationSchemas";
import {
  createSchool,
  updateSchool,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { School } from "@prisma/client";

interface SchoolFormProps {
  initialData?: School;
}

const SchoolForm = ({ initialData }: SchoolFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolSchema>({
    resolver: zodResolver(schoolSchema),
    defaultValues: initialData ? {
      id: initialData.id,
      name: initialData.name,
      code: initialData.code || undefined,
      address: initialData.address || undefined,
      phone: initialData.phone || undefined,
      email: initialData.email || undefined,
      domain: initialData.domain || undefined,
    } : {}
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE
  const initialState = {
    success: false,
    error: false,
    message: ""
  };
  const [img, setImg] = useState<string>(initialData?.logo || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useFormState(
    initialData ? updateSchool : createSchool, 
    initialState
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Form data being submitted:", data);
    setIsSubmitting(true);
    // Include the uploaded image URL in the form data
    formAction({...data, logo: img});
  });

  const router = useRouter();

  useEffect(() => {
    console.log("Form state:", state);
    setIsSubmitting(false);
    if (state.success) {
      toast.success(initialData ? "School has been updated!" : "School has been created!");
      router.push("/super-admin/schools");
    } else if (state.error) {
      // Cast state to include possible message property
      const errorState = state as { success: boolean; error: boolean; message?: string };
      if (errorState.message === "School code already exists") {
        toast.error("School code already exists. Please use a unique code.");
      } else {
        toast.error("Failed to create school. Please try again.");
      }
    }
  }, [state, router, initialData]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{initialData ? "Edit school" : "Create a new school"}</h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="School name"
          name="name"
          register={register}
          error={errors?.name}
          inputProps={{ required: true }}
        />
        <InputField
          label="School code (optional)"
          name="code"
          register={register}
          error={errors?.code}
          inputProps={{ placeholder: "e.g., GREENWOOD_HS" }}
        />
        <InputField
          label="Address (optional)"
          name="address"
          register={register}
          error={errors?.address}
        />
        <InputField
          label="Phone (optional)"
          name="phone"
          register={register}
          error={errors?.phone}
        />
        <InputField
          label="Email (optional)"
          name="email"
          register={register}
          error={errors?.email}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">School Logo</label>
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result: any, { widget }) => {
              // Check if result.info exists and has secure_url
              if (result?.info?.secure_url) {
                // Log the full info object to see all available properties
                console.log('Upload result info:', JSON.stringify(result.info, null, 2));
                
                // Set the secure URL (this is the direct link to the uploaded image)
                setImg(result.info.secure_url);
                toast.success("Logo uploaded successfully!");
              } else {
                console.error('No secure URL found in upload result', result);
                toast.error("Failed to upload logo");
              }
              widget.close();
            }}
            onError={(error) => {
              console.error('Upload error:', error);
              toast.error("Error uploading logo");
            }}
          >
            {({ open }) => {
              return (
                <div className="flex flex-col gap-2">
                  <div
                    className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer ring-[1.5px] ring-gray-300 p-2 rounded-md"
                    onClick={() => open()}
                  >
                    <Image src="/upload.png" alt="Upload" width={24} height={24} />
                    <span>Click to upload logo</span>
                  </div>
                  
                  {/* Display the uploaded image if available */}
                  {img && (
                    <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden">
                      <Image 
                        src={img} 
                        alt="Uploaded school logo" 
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {img ? "Logo uploaded" : "No logo uploaded yet"}
                  </p>
                </div>
              );
            }}
          </CldUploadWidget>
        </div>
        <InputField
          label="Domain"
          name="domain"
          register={register}
          error={errors?.domain}
          inputProps={{ placeholder: "e.g., school.edu" }}
        />
      </div>
      {state.error && (
        <span className="text-red-500 bg-red-50 p-3 rounded-md border border-red-200 inline-block">
          Something went wrong while creating the school. Please try again or check the console for details.
        </span>
      )}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 text-gray-700 p-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="bg-lamaPurple text-white p-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (initialData ? "Updating..." : "Creating...") 
            : (initialData ? "Update School" : "Create School")
          }
        </button>
      </div>
    </form>
  );
};

export default SchoolForm;