// Header.js
import React from "react";
import Button from "./button";

const Header = () => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <Button text="Regra dos Trapézios" link="/regra-trapezio" />
      <Button text="Regra de 1/3 de simpson" link="/regra-simpson" />
    </div>
  );
};

export default Header;
