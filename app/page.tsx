import RequestForm3 from "@/components/RequestForm3";

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center 
      bg-gradient-to-b from-[#ccb36e]/10 via-white to-white 
      dark:from-[#ccb36e]/5 dark:via-zinc-900 dark:to-black
      py-2"
      // p-2 sm:p-4 md:p-8 lg:p-12
    >
      {/* Form Bileşeni */}
      <div
        className="
        w-full 
        max-w-7xl 
        px-1                   /* ⬅ Mobilde minimum boşluk */
        sm:px-3                /* ⬅ Tablet altı küçük ekran */
        md:px-4                /* ⬅ Tablet */
        lg:px-6                /* ⬅ Büyük ekran */
      "
      >
        <RequestForm3 />
      </div>
    </main>
  );
}
