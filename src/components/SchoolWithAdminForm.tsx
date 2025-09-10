"use client";



import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  schoolWithAdminSchema,
  SchoolWithAdminSchema,
} from "@/lib/formValidationSchemas";
import { createSchoolWithAdmin } from "@/lib/actions";
import InputField from "./InputField";
import { School } from "@prisma/client";

interface SchoolWithAdminFormProps {
  initialData?: School;
}

 const SchoolWithAdminForm = ({ initialData }: SchoolWithAdminFormProps) => {
  const [state, formAction] = useFormState(createSchoolWithAdmin, {
    success: false,
    error: false,
  });




  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolWithAdminSchema>({
    resolver: zodResolver(schoolWithAdminSchema),
    defaultValues: {
      // School fields
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      logo: "",
      domain: "",
      // Admin fields
      adminUsername: "",
      adminPassword: "",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log("School with admin data being submitted:", data);
    formAction(data);
  });

  useEffect(() => {
    if (state.success) {
      toast.success("School and administrator created successfully!");
    } else if (state.error) {
      toast.error(state.message || "Something went wrong!");
    }
  }, [state]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Create a new school with administrator</h1>
      
      {/* School Information Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-medium mb-4">School Information</h2>
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="School Name"
            name="name"
            register={register}
            error={errors?.name}
            inputProps={{ required: true }}
          />
          <InputField
            label="School Code (Optional)"
            name="code"
            register={register}
            error={errors?.code}
            inputProps={{ placeholder: "e.g., GREENWOOD_HS" }}
          />
          <InputField
            label="Address"
            name="address"
            register={register}
            error={errors?.address}
          />
          <InputField
            label="Phone"
            name="phone"
            register={register}
            error={errors?.phone}
            inputProps={{ type: "tel" }}
          />
          <InputField
            label="Email"
            name="email"
            register={register}
            error={errors?.email}
            inputProps={{ type: "email" }}
          />
          <InputField
            label="Logo URL (Optional)"
            name="logo"
            register={register}
            error={errors?.logo}
            inputProps={{ type: "url", placeholder: "https://..." }}
          />
          <InputField
            label="Domain (Optional)"
            name="domain"
            register={register}
            error={errors?.domain}
            inputProps={{ placeholder: "school.edu" }}
          />
        </div>
      </div>
      
      {/* Admin Information Section */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h2 className="text-lg font-medium mb-4">School Administrator</h2>
        <div className="flex justify-between flex-wrap gap-4">
          <InputField
            label="Admin Username"
            name="adminUsername"
            register={register}
            error={errors?.adminUsername}
            inputProps={{ required: true }}
          />
          <InputField
            label="Admin Password"
            name="adminPassword"
            register={register}
            error={errors?.adminPassword}
            inputProps={{ type: "password", required: true }}
          />
          <InputField
            label="Admin First Name"
            name="adminFirstName"
            register={register}
            error={errors?.adminFirstName}
            inputProps={{ required: true }}
          />
          <InputField
            label="Admin Last Name"
            name="adminLastName"
            register={register}
            error={errors?.adminLastName}
            inputProps={{ required: true }}
          />
          <InputField
            label="Admin Email (Optional)"
            name="adminEmail"
            register={register}
            error={errors?.adminEmail}
            inputProps={{ type: "email" }}
          />
        </div>
      </div>
      
      {/* Form submission buttons */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500 transition-colors"
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
        >
          Create School & Administrator
        </button>
      </div>
      
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.message || "Something went wrong. Please try again."}
        </div>
      )}
    </form>
  );
};

export default SchoolWithAdminForm;


