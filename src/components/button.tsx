"use client";

import Link from "next/link";
import React from "react";

interface ButtonProps {
  text: string;
  link: "/regra-trapezio" | "/regra-simpson";
}

const Button = ({ text, link }: ButtonProps) => {
  return (
    <Link
      className="
    p-2
    bg-green-500
    text-white
    rounded
  "
      href={link}
    >
      {text}
    </Link>
  );
};

export default Button;
