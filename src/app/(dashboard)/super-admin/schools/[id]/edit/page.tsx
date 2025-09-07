import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SchoolForm from "@/components/forms/SchoolForm";

const EditSchoolPage = async ({ params }: { params: { id: string } }) => {
  const school = await prisma.school.findUnique({
    where: { id: params.id },
  });

  if (!school) {
    redirect("/super-admin/schools");
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <SchoolForm initialData={school} />
    </div>
  );
};

export default EditSchoolPage;
