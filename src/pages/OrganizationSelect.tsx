import { useEffect, useState } from "react";

export const OrganizationSelect = () => {
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/organizations")
      .then(res => res.json())
      .then(data => setOrgs(data));
  }, []);

  const createOrg = async () => {
    const name = prompt("Organization Name");

    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name })
    });

    const org = await res.json();

    localStorage.setItem("orgId", org._id);
    window.location.href = "/";
  };

  const selectOrg = (id: string) => {
    localStorage.setItem("orgId", id);
    window.location.href = "/";
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-black">Select Organization</h1>

      {orgs.map(org => (
        <div
          key={org._id}
          onClick={() => selectOrg(org._id)}
          className="p-4 border cursor-pointer"
        >
          {org.name}
        </div>
      ))}

      <button onClick={createOrg}>+ Create Organization</button>
    </div>
  );
};