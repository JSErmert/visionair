import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = typeof next === "string" && next.startsWith("/") ? next : "/build/library";
  return (
    <div className="min-h-screen bg-[#faf9f6] px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <LoginClient next={dest} />
      </div>
    </div>
  );
}
