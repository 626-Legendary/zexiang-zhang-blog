import Image from "next/image";

export default function NotFound() {
  return (
    <div
      className="w-full h-screen bg-cover bg-center flex flex-col justify-center items-center"
      style={{
        backgroundImage: "url('/images/404/bg.svg')",
      }}
    >
      {/* Astronaut + Particle Effect Overlay */}
      <div className="relative w-[300px] h-[300px] flex justify-center items-center">
        {/* 底层粒子特效 */}
        <Image
          src="/images/404/particle-effect.svg"
          alt="Particles"
          fill
          className="absolute inset-0 object-contain z-0"
        />

        {/* 上层 Astronaut */}
        <Image
          src="/images/404/astronaut.svg"
          alt="Astronaut"
          width={300}
          height={300}
          className="z-10"
        />
      </div>

      {/* Text */}
      <div className="text-center mt-4">
        <h1 className="font-extrabold text-6xl">404</h1>
        <h2 className="font-bold text-4xl">PAGE NOT FOUND</h2>
        <h3 className="text-2xl">Your search has ventured beyond the known universe.</h3>
      </div>
    </div>
  );
}
