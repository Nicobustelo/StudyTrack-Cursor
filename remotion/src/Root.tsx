import React from "react";
import { Composition } from "remotion";
import { Teaser916, TEASER_DURATION } from "./Teaser916";
import { Demo169, DEMO_DURATION } from "./Demo169";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Teaser916"
        component={Teaser916}
        durationInFrames={TEASER_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Demo169"
        component={Demo169}
        durationInFrames={DEMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
