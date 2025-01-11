import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { currentRouteAtom } from "../../atoms";
import Featured from "./Featured";

interface ResourceItem {
  imageSrc: string;
  title: string;
  description: string;
  route: string;
}

const resourceItems: ResourceItem[] = [
  {
    imageSrc: "/Audits.png",
    title: "Audits",
    description:
      "Curious to see which protocols have been audited & by whom? Here you’ll find all ecosystem-wide audit reports.",
    route: "/audits",
  },
  {
    imageSrc: "/Auditors.png",
    title: "Auditors",
    description:
      "Want to connect or learn from the best in the game? Here you’ll find Clarity & security experts.",
    route: "/auditors",
  },
  {
    imageSrc: "/Research.png",
    title: "Research",
    description:
      "We don’t repeat mistakes. Here you’ll find all previous exploit explanations as well as relevant security research.",
    route: "/research",
  },
  {
    imageSrc: "/Tools.png",
    title: "Tools",
    description:
      "Need some additional help securing your contracts? Here you’ll find all available development tools in Clarity.",
    route: "/tools",
  },
];

const Resources: React.FC = () => {
  const router = useRouter();
  const [, setCurrentRoute] = useAtom(currentRouteAtom);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    router.push(route);
  };

  return (
    <section className="max-w-7xl md:mx-5 mt-24">
      <div className="bg-main-dark-grey w-screen md:w-auto rounded-t-3xl p-8 md:p-12 mx-0 md:mx-0">
        <h2 className="text-[24px] md:text-[36px] font-space-grotesk text-secondary-white mb-4 text-center">
          Security Resources For <span className="underline">You</span>
        </h2>
        <p className="text-secondary-white mb-12 text-[16px] md:text-[20px] font-space-grotesk font-light text-center">
          Enter into the world of sBTC with these resources
        </p>

        <div className="flex flex-col items-center md:items-stretch">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 w-full place-items-center">
            {resourceItems.slice(0, 2).map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-start h-[289px] w-[322px] md:h-[520px] md:w-full bg-background rounded-xl cursor-pointer"
                onClick={() => handleNavigate(item.route)}
              >
                <div className="relative h-[220px] md:h-[330px] w-full">
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    className="object-cover rounded-t-xl"
                    priority
                  />
                </div>
                <div className="flex flex-col items-start justify-center p-6 h-[69px] md:h-[190px]">
                  <h3 className="text-[22px] font-space-grotesk font-bold text-secondary-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-secondary-white text-base hidden md:block">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 w-full place-items-center">
            {resourceItems.slice(2, 4).map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-start h-[289px] w-[322px] md:h-[520px] md:w-full bg-background rounded-xl cursor-pointer"
                onClick={() => handleNavigate(item.route)}
              >
                <div className="relative h-[220px] md:h-[330px] w-full">
                  <Image
                    src={item.imageSrc}
                    alt={item.title}
                    fill
                    className="object-cover rounded-t-xl"
                    priority
                  />
                </div>
                <div className="flex flex-col items-start justify-center p-6 h-[69px] md:h-[190px]">
                  <h3 className="text-[22px] font-space-grotesk font-bold text-secondary-white">
                    {item.title}
                  </h3>
                  <p className="text-secondary-white text-base hidden md:block">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-secondary-white text-center text-[20px] mb-5">
          Or, if you're interested in applying click{" "}
          <span
            className="underline cursor-pointer hover:text-main-orange transition-colors duration-200"
            onClick={() => handleNavigate("/apply")}
          >
            here
          </span>
        </p>
        <Featured />
      </div>
    </section>
  );
};

export default Resources;
