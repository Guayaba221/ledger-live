// @flow

import React from "react";
import { Svg, Circle, G, Text } from "react-native-svg";
import colors from "../colors";

type Props = {
  // float number between 0 and 1
  progress: number,
  size?: number,
  progressColor?: string,
  backgroundColor?: string,
};

const R = 26;
const CENTER = 38;

export default ({
  size = 53,
  backgroundColor = colors.lightFog,
  progressColor = colors.live,
  progress,
}: Props) => (
  <Svg width={size} height={size} viewBox="0 0 76 76">
    <Circle
      cx={CENTER}
      cy={CENTER}
      r={R}
      fill="none"
      stroke={backgroundColor}
      strokeWidth={4}
    />
    <G transform={{ rotation: -90, originX: CENTER, originY: CENTER }}>
      <Circle
        cx={CENTER}
        cy={CENTER}
        r={R}
        fill="none"
        stroke={progressColor}
        strokeWidth={4}
        strokeDasharray={[Math.PI * R * 2 * progress, Math.PI * R * 2 * 1]}
        strokeDashoffset={0}
        strokeLinecap="round"
      />
    </G>
    <Text
      fill={progressColor}
      stroke="none"
      fontSize={16}
      fontWeight="bold"
      x={CENTER - 6}
      y={CENTER + 6}
      textAnchor="middle"
    >
      {Number(progress * 1e2).toFixed(0)}%
    </Text>
  </Svg>
);
