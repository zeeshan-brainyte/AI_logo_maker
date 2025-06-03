import React, { useState, useEffect, useRef } from "react";
import PromptTemplate from "./PromptTemplate";

const MainContainer = () => {
    return (
        <div className="MainContainer">
            <div className="flex items-center justify-center h-dvh flex-col">
                <PromptTemplate />
            </div>
        </div>
    );
};

export default MainContainer;
