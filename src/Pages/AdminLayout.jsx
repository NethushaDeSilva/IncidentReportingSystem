import RoleLayout from "../Components/RoleLayout";

export default function AdminLayout({ children }) {
  return <RoleLayout role="admin">{children}</RoleLayout>;
}
