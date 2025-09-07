"use client";

import { UserButton } from "@clerk/nextjs";

export const NavbarUser = () => {
  return (
    <>
      <div className="flex flex-col">
        <span className="text-xs leading-3 font-medium">
          User
        </span>
        <span className="text-[10px] text-gray-500 text-right">
          Role
        </span>
      </div>
      <UserButton afterSignOutUrl="/" />
    </>
  );
};
