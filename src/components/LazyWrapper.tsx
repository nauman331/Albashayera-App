import React, { Suspense } from "react";
import { Text } from "react-native";

const LazyWrapper = (Component: React.FC) => (props: any) => (
  <Suspense fallback={<Text>Loading...</Text>}>
    <Component {...props} />
  </Suspense>
);

export default LazyWrapper;
