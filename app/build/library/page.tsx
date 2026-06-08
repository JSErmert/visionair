import LibraryClient from "./LibraryClient";

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <LibraryClient />
      </div>
    </div>
  );
}
