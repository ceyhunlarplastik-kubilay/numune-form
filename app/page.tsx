import RequestForm from "@/components/RequestForm";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-b from-[#ccb36e]/10 via-white to-white dark:from-[#ccb36e]/5 dark:via-zinc-900 dark:to-black">
      {/* Logo ve Başlık Grubu - Daha sıkı */}
      <div className="text-center mb-6 md:mb-8">
        {/* Logo */}
        <div className="mb-4 md:mb-5">
          {" "}
          {/* mb-1'den mb-4'e çıkardım */}
          <div
            className="relative w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto"
            style={{ aspectRatio: "1470/341" }}
          >
            <Image
              src="/ceyhunlar.png"
              alt="Ceyhunlar Plastik Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Ana Başlık */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-800 dark:text-white mb-1">
          Ceyhunlar Plastik
        </h1>

        {/* Alt Başlık - Altın rengi ve çizgiler */}
        <div className="flex items-center justify-center space-x-2 mb-2 md:mb-3">
          <div className="w-8 md:w-10 h-px bg-[#ccb36e]/50"></div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-medium text-[#ccb36e] dark:text-[#ccb36e]">
            Numune Talep Formu
          </h2>
          <div className="w-8 md:w-10 h-px bg-[#ccb36e]/50"></div>
        </div>
      </div>

      {/* Açıklama Metni */}
      <div className="w-full max-w-md md:max-w-lg mb-6 md:mb-8 px-4">
        <div className="relative">
          {/* Dekoratif altın çizgi */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-[#ccb36e] to-transparent"></div>

          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 text-center leading-relaxed font-light pt-4">
            Ürünlerimizin kalitesini bizzat deneyimlemek için formu doldurun,
            size özel numunelerimizi adresinize gönderelim.
          </p>

          {/* Dekoratif nokta */}
          {/* <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#ccb36e] rounded-full"></div> */}
        </div>
      </div>

      {/* Form Bileşeni */}
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl px-4">
        <RequestForm />
      </div>

      {/* Alt Bilgi */}
      <div className="mt-8 md:mt-10 px-4">
        <div className="flex items-center justify-center space-x-4 mb-2">
          <div className="w-8 h-px bg-[#ccb36e]/30"></div>
          <span className="text-xs text-[#ccb36e] font-medium">
            GÜVENLİ FORMLAR
          </span>
          <div className="w-8 h-px bg-[#ccb36e]/30"></div>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
          Gönderdiğiniz bilgiler gizli tutulacaktır • 7/24 Destek
        </p>
        <div className="mt-2"></div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
          Copyright © 2025 Ceyhunlar - Tüm hakları saklıdır.
        </p>
      </div>
    </main>
  );
}
