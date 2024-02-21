import BioContainerSSR from "@/components/root/biographies/BioContainerSSR";

export const metadata = {
  title: "Biographies || Netcico",
  description:
    "Age, gender, height, early life and  intresting biographies of popular people around the world.",
};

const Page = () => {
  return (
    <>
      <div className="">
        <h1 className="text-[30px]  text-center sm:text-left px-4 text-gray-800 ">
          Biographies
        </h1>
      </div>
      <BioContainerSSR />
    </>
  );
};

export default Page;
