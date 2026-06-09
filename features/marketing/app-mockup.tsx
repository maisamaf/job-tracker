import Image from "next/image";

export function AppMockup() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl border bg-card overflow-hidden shadow-sm">
        <Image src="/images/hero-screenshot.png" alt="JobTrackr" className="object-fill" width={1000} height={1000} />
    </div>
  );
}
