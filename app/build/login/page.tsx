import LoginClient from "./LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = typeof next === "string" && next.startsWith("/") ? next : "/build/library";
  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-6 py-8">
      <div className="mx-auto w-full max-w-xl">
        <LoginClient next={dest} />
      </div>
    </div>
  );
}
