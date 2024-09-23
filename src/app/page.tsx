import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="flex flex-row p-5 sm:py-10 sm:px-20 justify-between">
        <div className="flex flex-col w-full sm:w-[40%] justify-center">
          <p className="text-center sm:text-left text-6xl md:text-5xl lg:text-7xl xl:text-8xl font-bold mb-10 break-normal inline-block text-transparent bg-clip-text bg-gradient-to-br from-slate-950 to-slate-500 pb-5">
            Welcome to Designio!
          </p>
          <p className="text-2xl xl:text-3xl flex flex-wrap text-center sm:text-left mb-6 break-normal text-gray-800">
            Discover the ultimate way to manage your design projects! Sign up as
            a client, designer or as a project manager.
          </p>
          <div className="flex flex-col">
            
            <div>
              <Image
                alt="landing_image"
                src="/images/landing_image.svg"
                className="block sm:hidden w-full h-auto object-contain"
                width={50}
                height={50}
              />
            </div>
          </div>
        </div>
        <div className="justify-end w-[60%] items-center hidden sm:flex">
          <Image
            alt="landing_image"
            src="/images/landing_image.svg"
            className="w-full h-auto object-contain"
            width={50}
            height={50}
          />
        </div>
      </div>
    </div>
  );
}
