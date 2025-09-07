import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { getSchoolsWithCache } from "@/lib/actions";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { School } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';

type SchoolWithCounts = School & { 
  _count: { 
    students: number; 
    teachers: number;
    admins: number;
  } 
};

const SchoolsPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Code",
      accessor: "code",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden md:table-cell",
    },
    {
      header: "Users",
      accessor: "users",
      className: "hidden lg:table-cell",
    },
    {
      header: "Created",
      accessor: "created",
      className: "hidden lg:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: SchoolWithCounts) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.logo || "/singleBranch.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.domain || item.email || 'No contact info'}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.code || '—'}</td>
      <td className="hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="hidden lg:table-cell">
        <div className="flex flex-col">
          <span>{item._count.students} Students</span>
          <span>{item._count.teachers} Teachers</span>
        </div>
      </td>
      <td className="hidden lg:table-cell">
        {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : '—'}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/super-admin/schools/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <Link href={`/super-admin/schools/${item.id}/edit`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/update.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <FormContainer table="school" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Use cached query for better navigation UX
  const [data, count] = await getSchoolsWithCache(p, queryParams);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Schools</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <Link href="/super-admin/schools/create">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaGreen">
                <Image src="/create.png" alt="" width={14} height={14} />
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SchoolsPage;
