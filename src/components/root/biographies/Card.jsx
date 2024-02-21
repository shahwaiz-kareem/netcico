import Image from "next/image";
import "./globals.css";
import { GoHeartFill } from "react-icons/go";
import { Alegreya } from "next/font/google";
import { FaEye } from "react-icons/fa";
import { FaShare } from "react-icons/fa";

const alegreya = Alegreya({ subsets: ["cyrillic"], weight: "700" });
import Link from "next/link";
const Card = ({
  name,
  thumbnail,
  slug,
  category,
  altText,
  fans,
  share,
  views,
}) => {
  return (
    <article className="card overflow-hidden   h-[320px] rounded-xl transition-all duration-150 flex w-full px-4 my-4  md:w-1/2 lg:w-1/3  2xl:w-1/4 ">
      <div className="relative rounded-xl w-full bg-zinc-800">
        <Link href={`/biographies/${category}/${slug}`}>
          <Image
            className="avatar   rounded-xl  h-full"
            height={720}
            width={1280}
            alt={altText}
            src={thumbnail}
          />
        </Link>
        <div
          className={`card_content  rounded-lg overflow-hidden ${
            name.length < 20 ? "max-lg:h-32" : "max-lg:h-[10rem] "
          } flex h-14 flex-col px-2 py-2 text-white absolute bottom-0  w-full gap-3`}
        >
          <h2 className={alegreya.className + "  text-2xl    mt-2"}>{name}</h2>
          <div className="w-2">
            <span className="bg-[#1970d5] inline rounded p-1">
              <span className={alegreya.className}>{category}</span>
            </span>
          </div>
          <div className="flex h-full gap-4">
            <div className="text-white cursor-pointer flex items-center justify-center gap-1">
              <GoHeartFill className="text-2xl hover:text-red-500" />
              <span className="text-sm font-light">
                {Intl.NumberFormat("en", { notation: "compact" }).format(
                  Number(fans)
                )}
              </span>
            </div>
            <div className="text-white  flex items-center justify-center gap-1">
              <FaEye className="text-2xl " />
              <span className="text-sm font-light">
                {Intl.NumberFormat("en", { notation: "compact" }).format(
                  Number(views)
                )}
              </span>
            </div>
            <div className="text-white cursor-pointer flex items-center justify-center gap-1">
              <FaShare className="text-2xl hover:text-blue-500" />
              <span className="text-sm font-light">
                {Intl.NumberFormat("en", { notation: "compact" }).format(
                  Number(share)
                )}
              </span>
            </div>
          </div>
          <div className="div_move absolute rounded-lg bottom-0 bg-[#1970d5] w-32 h-1 "></div>
        </div>
      </div>
    </article>
  );
};

export default Card;
