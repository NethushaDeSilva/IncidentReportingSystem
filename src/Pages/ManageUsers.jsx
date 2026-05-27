import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, X } from "lucide-react";
import { useApp } from "../Context/AppContextBase";
import { useUsers } from "../hooks/useUsers";
import { deleteManagedUser, updateManagedUser } from "../services/userService";
import { notifyUser } from "../utils/browserCapabilities";
import { ROLES, normalizeRole } from "../utils/roles";
import AdminLayout from "./AdminLayout";

export default function ManageUsers() {
  const { appConfig } = useApp();
  const { error, loading, users } = useUsers();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return users.filter((user) => {
      if (!needle) return true;
      return [user.fullName, user.email, user.role, user.mobile, user.nic, user.status, user.responseUnitId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(needle));
    });
  }, [search, users]);

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.fullName || user.email}?`)) return;
    await deleteManagedUser(user.id);
    await notifyUser(appConfig.brand.name, "User deleted.");
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const role = form.get("role");

    try {
      await updateManagedUser(editing.id, {
        fullName: form.get("fullName"),
        email: form.get("email"),
        mobile: form.get("mobile"),
        role,
        responseUnitId: role === "paramedic" ? form.get("responseUnitId") || "" : "",
        status: form.get("status"),
      });
      await notifyUser(appConfig.brand.name, "User updated.");
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#5F675C] dark:text-slate-400">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Manage Users</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">User accounts</p>
        </div>
        <Link
          to="/admin/add-user"
          className="inline-flex justify-center rounded-lg bg-[#3D4461] px-7 py-3 font-black text-white shadow-lg transition hover:bg-[#30364f]"
        >
          ADD USER
        </Link>
      </header>

      <section className="rounded-lg bg-white p-5 shadow-xl dark:bg-slate-900 sm:p-6">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          className="field-input mb-4"
        />

        {error && <p className="mb-4 rounded-lg bg-rose-50 p-4 font-bold text-rose-700">{error}</p>}

        <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-white/10">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-5 py-4">User ID</th>
                <th className="px-5 py-4">Username</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Response Unit</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center font-bold text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center font-bold text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{user.id.slice(0, 10)}</td>
                    <td className="px-5 py-4 font-black">{user.fullName || "-"}</td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {getResponseUnitName(user.responseUnitId, appConfig.responseUnits)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{user.email || "-"}</td>
                    <td className="px-5 py-4 font-bold">{user.status || "Active"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(user)}
                          className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Edit size={17} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <EditUserDialog
          appConfig={appConfig}
          user={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </AdminLayout>
  );
}

function getResponseUnitName(unitId, responseUnits) {
  if (!unitId) return "-";
  return responseUnits.find((unit) => unit.id === unitId)?.name || unitId;
}

function RoleBadge({ role }) {
  const nextRole = normalizeRole(role);
  const roleClass =
    nextRole === "admin"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-200"
      : nextRole === "dispatcher"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200"
        : nextRole === "paramedic"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${roleClass}`}>
      {nextRole}
    </span>
  );
}

function EditUserDialog({ appConfig, onClose, onSubmit, saving, user }) {
  const [role, setRole] = useState(normalizeRole(user.role));

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4">
      <section className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black">EDIT USER DETAILS</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name">
              <input name="fullName" defaultValue={user.fullName || ""} className="field-input" required />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={user.email || ""} className="field-input" required />
            </Field>
            <Field label="Phone Number">
              <input name="mobile" defaultValue={user.mobile || ""} className="field-input" />
            </Field>
            <Field label="Role">
              <select name="role" value={role} onChange={(event) => setRole(event.target.value)} className="field-input">
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role[0].toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            {role === "paramedic" && (
              <Field label="Response Unit">
                <select name="responseUnitId" defaultValue={user.responseUnitId || ""} className="field-input">
                  <option value="">All assigned units</option>
                  {appConfig.responseUnits.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Status">
              <select name="status" defaultValue={user.status || "Active"} className="field-input">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-100 px-5 py-3 font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Reset
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#3D4461] px-5 py-3 font-black text-white disabled:opacity-60">
              {saving ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ children, label }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}
