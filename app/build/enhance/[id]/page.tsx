import EnhanceClient from "./EnhanceClient";

export default async function EnhancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-[#faf9f6] px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <EnhanceClient sessionId={Number(id)} />
      </div>
    </div>
  );
}
