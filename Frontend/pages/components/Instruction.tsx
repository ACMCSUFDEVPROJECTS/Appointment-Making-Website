import { NextPage } from "next";
import Image from "next/image";
import React from "react";
import { useAnimation, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import StepOne from "../../assets/step1.svg";
import StepTwoZero from "../../assets/step2.svg";
import StepTwoOne from "../../assets/step2-1.svg";
import StepTwoTwo from "../../assets/step2-2.svg";
import { useEffect } from "react";
import NotionAuthButton from "./NotionAuth";

interface instructionType {
  id: string;
  label: string;
  image: string[];
  button?: React.ReactElement;
}

export const squareVariants = {
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  hidden: { opacity: 0, scale: 0 },
};

const instructionData: instructionType[] = [
  {
    id: "01",
    label: "Connect your Notion",
    image: [],
    button: <NotionAuthButton/>,
  },
  {
    id: "02",
    label: "Get your Canvas domain",
    image: [StepOne],
  },
  {
    id: "03",
    label: "Get your Canvas API Key",
    image: [StepTwoZero, StepTwoOne, StepTwoTwo],
  },
  {
    id: "04",
    label: "Fill out this form",
    image: [],
  },
];

const Instruction: NextPage = () => {
  return (
    <section>
      {instructionData.map((step) => {
        return (
          <>
            <p
              key={step.id}
              className="text-[2.25rem] text-black font-chivo mt-10"
            >
              <span className="rounded-[50%] text-white p-2 mr-5 bg-pink-500 text-center">
                {step.id}
              </span>
              {step.label}
            </p>
            {step.image.map((url, idx) => {
              return (
                <div key={idx} className="mt-10">
                  <InstructionPic picUrl={url} />
                </div>
              );
            })}
            {step.button}
          </>
        );
      })}
    </section>
  );
};

interface picProps {
  picUrl: string;
}

export const InstructionPic: React.FC<picProps> = (props) => {
  const { picUrl } = props;
  const control = useAnimation();
  const [ref, inView] = useInView();
  useEffect(() => {
    if (inView) {
      control.start("visible");
    }
  }, [control, inView]);
  return (
    <motion.div
      ref={ref}
      animate={control}
      initial="hidden"
      variants={squareVariants}
      className="mt-10"
    >
      <Image src={picUrl} alt="instruction"/>
    </motion.div>
  );
};

export default Instruction;
